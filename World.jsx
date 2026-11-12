import React, { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, ContactShadows, Html, Environment as DreiEnvironment } from '@react-three/drei'
import * as THREE from 'three'

function House({ position, size, color, rotation=0 }) {
  return <group position={position} rotation={[0,rotation,0]}>
    <mesh position={[0,size[1]/2,0]} castShadow receiveShadow>
      <boxGeometry args={size}/><meshStandardMaterial color={color} roughness={0.92}/>
    </mesh>
    <mesh position={[0,size[1]+.13,0]} castShadow>
      <boxGeometry args={[size[0]+.35,.25,size[2]+.35]}/><meshStandardMaterial color="#9a654b"/>
    </mesh>
    <mesh position={[0,.85,size[2]/2+.012]}>
      <planeGeometry args={[.8,1.7]}/><meshStandardMaterial color="#50372b"/>
    </mesh>
  </group>
}
function Tree({position,scale=1}) {
  return <group position={position} scale={scale}>
    <mesh position={[0,1,0]} castShadow><cylinderGeometry args={[.18,.28,2,8]}/><meshStandardMaterial color="#755039"/></mesh>
    <mesh position={[0,2.35,0]} castShadow><sphereGeometry args={[1.15,10,8]}/><meshStandardMaterial color="#397b42"/></mesh>
  </group>
}
function PlacedObject({item}) {
  if(item.type==='tree') return <Tree position={[item.x,0,item.z]} scale={1.05}/>
  if(item.type==='tank') return <group position={[item.x,0,item.z]}>
    <mesh position={[0,1.8,0]} castShadow><cylinderGeometry args={[1.1,1.1,3.6,20]}/><meshStandardMaterial color="#6ba6c7" metalness={.35}/></mesh>
    <mesh position={[0,3.65,0]}><cylinderGeometry args={[1.12,1.12,.12,20]}/><meshStandardMaterial color="#d3e8ee"/></mesh>
    <mesh position={[0,.12,0]}><cylinderGeometry args={[1.35,1.35,.24,20]}/><meshStandardMaterial color="#555d60"/></mesh>
  </group>
  if(item.type==='park') return <group position={[item.x,0,item.z]}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.06,0]}><circleGeometry args={[2.6,32]}/><meshStandardMaterial color="#6d9d58"/></mesh>
    {[-1.5,1.5].map((x,i)=><Tree key={i} position={[x,0,0]} scale={.55}/>)}
    <mesh position={[0,.35,0]}><boxGeometry args={[1.5,.18,.5]}/><meshStandardMaterial color="#9b7650"/></mesh>
  </group>
  if(item.type==='library') return <group position={[item.x,0,item.z]}>
    <mesh position={[0,1.2,0]} castShadow><boxGeometry args={[4,2.4,3.5]}/><meshStandardMaterial color="#e2c69b"/></mesh>
    <mesh position={[0,2.55,0]}><coneGeometry args={[2.9,.9,4]}/><meshStandardMaterial color="#9a5742"/></mesh>
    <mesh position={[0,.9,1.77]}><planeGeometry args={[1,1.7]}/><meshStandardMaterial color="#4b352a"/></mesh>
    <Html position={[0,3.2,0]} center distanceFactor={12}><span className="world-label">LIBRARY</span></Html>
  </group>
  return null
}
function Player({onNear}) {
  const ref=useRef(), keys=useRef({}), yaw=useRef(0), drag=useRef(false), last=useRef(0)
  const {camera,gl}=useThree()
  useEffect(()=>{
    const down=e=>{keys.current[e.key.toLowerCase()]=true}
    const up=e=>{keys.current[e.key.toLowerCase()]=false}
    const pd=e=>{if(e.pointerType==='mouse'){drag.current=true;last.current=e.clientX}}
    const pu=()=>drag.current=false
    const pm=e=>{if(drag.current){yaw.current-=(e.clientX-last.current)*.006;last.current=e.clientX}}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up)
    gl.domElement.addEventListener('pointerdown',pd);window.addEventListener('pointerup',pu);window.addEventListener('pointermove',pm)
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);gl.domElement.removeEventListener('pointerdown',pd);window.removeEventListener('pointerup',pu);window.removeEventListener('pointermove',pm)}
  },[gl])
  useFrame((state,dt)=>{
    if(!ref.current)return
    const k=keys.current, forward=(k.w||k.arrowup?1:0)-(k.s||k.arrowdown?1:0), side=(k.d||k.arrowright?1:0)-(k.a||k.arrowleft?1:0)
    const v=new THREE.Vector3(side,0,-forward).applyAxisAngle(new THREE.Vector3(0,1,0),yaw.current)
    if(v.lengthSq()>0){v.normalize();ref.current.position.addScaledVector(v,dt*7);ref.current.rotation.y=Math.atan2(v.x,v.z)}
    ref.current.position.x=THREE.MathUtils.clamp(ref.current.position.x,-47,47)
    ref.current.position.z=THREE.MathUtils.clamp(ref.current.position.z,-47,47)
    const offset=new THREE.Vector3(Math.sin(yaw.current)*9,6,Math.cos(yaw.current)*9)
    const target=ref.current.position.clone().add(offset)
    camera.position.lerp(target,1-Math.pow(.001,dt));camera.lookAt(ref.current.position.x,1.2,ref.current.position.z)
    onNear?.(ref.current.position)
  })
  return <group ref={ref} position={[0,0,10]}>
    <mesh position={[0,1,0]} castShadow><capsuleGeometry args={[.42,.95,4,8]}/><meshStandardMaterial color="#287e91"/></mesh>
    <mesh position={[0,1.85,0]} castShadow><sphereGeometry args={[.31,16,12]}/><meshStandardMaterial color="#c98e68"/></mesh>
    <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.65,.78,24]}/><meshBasicMaterial color="#6ce7ef" transparent opacity={.8}/></mesh>
  </group>
}
function VillageWorld({items,onGroundClick,mode}) {
  const houses=useMemo(()=>{
    const arr=[],colors=['#d9b98a','#e8d9b8','#c78f65','#d2d4c9'];let id=0
    for(let z=-40;z<=40;z+=13) for(const x of [-20,-12,12,20]) arr.push({id:id++,position:[x,0,z],size:[4+(id%3),2.8+(id%2)*.5,4],color:colors[id%4],rotation:(id%4)*.2})
    return arr
  },[])
  const trees=useMemo(()=>Array.from({length:35},(_,i)=>({x:Math.sin(i*12.4)*43,z:Math.cos(i*7.7)*43})),[])
  return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.06,0]} receiveShadow onClick={onGroundClick}>
      <planeGeometry args={[100,100]}/><meshStandardMaterial color="#829b58" roughness={1}/>
    </mesh>
    <mesh position={[0,.015,0]}><boxGeometry args={[7,.04,100]}/><meshStandardMaterial color="#555b5b"/></mesh>
    <mesh position={[0,.02,0]}><boxGeometry args={[100,.04,7]}/><meshStandardMaterial color="#555b5b"/></mesh>
    {houses.map(h=><House key={h.id} {...h}/>)}
    {trees.map((p,i)=><Tree key={i} position={[p.x,0,p.z]} scale={.65+(i%3)*.12}/>)}
    {items.map(item=><PlacedObject key={item.id} item={item}/>)}
    {mode==='build' && <gridHelper args={[100,50,'#6ce7ef','#25434b']} position={[0,.04,0]}/>}
  </>
}
export default function World({items,mode,onPlace,onPlayerMove}) {
  const playerPos=useRef(new THREE.Vector3(0,0,10))
  const place=e=>{if(mode==='build'){e.stopPropagation();onPlace(e.point.x,e.point.z)}}
  return <Canvas shadows dpr={[1,1.5]} camera={{position:[0,7,20],fov:58}} onPointerMissed={()=>{}}>
    <color attach="background" args={['#9bc9dd']}/>
    <fog attach="fog" args={['#9bc9dd',45,115]}/>
    <Sky sunPosition={[80,25,40]} turbidity={7} rayleigh={1.1}/>
    <ambientLight intensity={.65}/>
    <directionalLight position={[-25,35,20]} intensity={2} castShadow shadow-mapSize={[1024,1024]}/>
    <DreiEnvironment preset="sunset"/>
    <EnvironmentContent/>
    <VillageWorld items={items} mode={mode} onGroundClick={place}/>
    <Player onNear={onPlayerMove}/>
    <ContactShadows position={[0,.01,0]} opacity={.28} scale={80} blur={2}/>
  </Canvas>
}
function EnvironmentContent(){
  return <group>
    {[-50,50].map(x=><mesh key={x} position={[x,7,-40]} rotation={[0,0,Math.PI/2]}><coneGeometry args={[15,35,4]}/><meshStandardMaterial color="#6d8b86"/></mesh>)}
  </group>
}
