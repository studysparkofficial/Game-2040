import React, { useEffect, useMemo, useState } from 'react'
import { Globe, Hammer, Map, Droplets, TreePine, Trees, BookOpen, CheckCircle2, RotateCcw, Info, Play, X } from 'lucide-react'
import World from './World.jsx'
import {translations,catalog} from './gameData.js'

const saved=()=>{try{return JSON.parse(localStorage.getItem('sathana2040')||'{}')}catch{return {}}}
export default function App(){
  const initial=saved()
  const [lang,setLang]=useState(initial.lang||'en')
  const [started,setStarted]=useState(false)
  const [mode,setMode]=useState('explore')
  const [active,setActive]=useState('tank')
  const [budget,setBudget]=useState(initial.budget??5000)
  const [xp,setXp]=useState(initial.xp??0)
  const [items,setItems]=useState(initial.items||[])
  const [modal,setModal]=useState('')
  const [notice,setNotice]=useState('')
  const [near,setNear]=useState(false)
  const t=translations[lang]
  const counts=useMemo(()=>Object.fromEntries(Object.keys(catalog).map(k=>[k,items.filter(i=>i.type===k).length])),[items])
  const missions=[['tank',2,t.mission1],['tree',3,t.mission2],['park',1,t.mission3],['library',1,t.mission4]]
  const completed=missions.filter(([k,n])=>counts[k]>=n).length
  useEffect(()=>{localStorage.setItem('sathana2040',JSON.stringify({lang,budget,xp,items}))},[lang,budget,xp,items])
  const ping=msg=>{setNotice(msg);setTimeout(()=>setNotice(''),2200)}
  const place=(x,z)=>{
    if(mode!=='build')return
    const item=catalog[active]
    if(budget<item.cost){ping(t.insufficient);return}
    setBudget(v=>v-item.cost);setXp(v=>v+item.xp)
    setItems(v=>[...v,{id:Date.now()+Math.random(),type:active,x,z}])
    ping(t.done)
  }
  const reset=()=>{if(confirm(lang==='hi'?'सारी स्थानीय प्रगति मिटाएँ?':'Reset all saved progress on this device?')){setBudget(5000);setXp(0);setItems([]);localStorage.removeItem('sathana2040')}}
  return <main className="app">
    {started&&<div className="world"><World items={items} mode={mode} onPlace={place} onPlayerMove={()=>{}}/></div>}
    <header className="topbar">
      <div className="brand"><span className="brand-mark">S</span><div><b>SATHANA <em>2040</em></b><small>VILLAGE FUTURES · COMMUNITY SANDBOX</small></div></div>
      <div className="top-actions">
        {started&&<><div className="stat"><small>{t.budget}</small><b>₹{budget.toLocaleString('en-IN')}</b></div><div className="stat"><small>{t.xp}</small><b>{xp} XP</b></div></>}
        <button className="icon-btn" onClick={()=>setLang(v=>v==='en'?'hi':'en')} aria-label="Change language"><Globe size={18}/><span>{t.language}</span></button>
      </div>
    </header>
    {!started?<section className="splash">
      <div className="eyebrow">AN INTERACTIVE COMMUNITY EXPERIENCE</div>
      <h1>SATHANA <span>2040</span></h1><p>{t.subtitle}</p>
      <div className="splash-card"><div className="orbit">✦</div><h2>{lang==='hi'?'भविष्य की कल्पना करें':'Imagine what comes next.'}</h2><p>{t.objective}</p><button className="primary large" onClick={()=>setStarted(true)}><Play size={17}/>{t.start}</button></div>
      <p className="fineprint">{t.disclaimer}</p>
    </section>:<>
      <aside className="left-panel glass">
        <div className="panel-title"><Map size={16}/>{t.missions}</div>
        {missions.map(([key,total,label])=><div className="mission" key={key}><div className="mission-line"><span>{label}</span><b>{Math.min(counts[key],total)}/{total}</b></div><div className="progress"><i style={{width:`${Math.min(100,counts[key]/total*100)}%`}}/></div></div>)}
        <div className="panel-foot"><CheckCircle2 size={14}/>{completed}/4 {lang==='hi'?'मिशन पूरे':'missions completed'}</div>
        <button className="subtle full" onClick={()=>setModal('about')}><Info size={15}/> {lang==='hi'?'गेम के बारे में':'About this game'}</button>
        <button className="subtle full" onClick={reset}><RotateCcw size={15}/> {t.reset}</button>
      </aside>
      <section className="bottom-panel glass">
        <div className="mode-row"><button className={mode==='explore'?'selected':''} onClick={()=>setMode('explore')}><Map size={15}/>{t.explore}</button><button className={mode==='build'?'selected build-selected':''} onClick={()=>setMode('build')}><Hammer size={15}/>{t.build}</button></div>
        {mode==='build'?<><p className="hint">{t.select}</p><div className="item-row">
          {Object.entries(catalog).map(([key,item])=><button key={key} className={`item ${active===key?'active':''}`} onClick={()=>setActive(key)}>
            {key==='tank'?<Droplets/>:key==='tree'?<TreePine/>:key==='park'?<Trees/>:<BookOpen/>}
            <span>{t[key]}</span>
          </button>)}
        </div></>:<p className="hint">{t.controls}</p>}
      </section>
      <div className="right-note glass"><b>{lang==='hi'?'खोजें और सीखें':'Explore & learn'}</b><span>{t.objective}</span></div>
      <div className="mobile-controls"><div className="dpad">
        <button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);window.dispatchEvent(new KeyboardEvent('keydown',{key:'w'}))}} onPointerUp={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'w'}))} onPointerCancel={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'w'}))}>▲</button>
        <div>
          <button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);window.dispatchEvent(new KeyboardEvent('keydown',{key:'a'}))}} onPointerUp={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'a'}))} onPointerCancel={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'a'}))}>◀</button>
          <button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);window.dispatchEvent(new KeyboardEvent('keydown',{key:'s'}))}} onPointerUp={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'s'}))} onPointerCancel={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'s'}))}>▼</button>
          <button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);window.dispatchEvent(new KeyboardEvent('keydown',{key:'d'}))}} onPointerUp={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'d'}))} onPointerCancel={()=>window.dispatchEvent(new KeyboardEvent('keyup',{key:'d'}))}>▶</button>
        </div>
      </div></div>
    </>}
    {notice&&<div className="toast">{notice}</div>}
    {modal==='about'&&<div className="modal-backdrop"><div className="modal glass"><button className="modal-x" onClick={()=>setModal('')}><X/></button><h2>{lang==='hi'?'इस गेम के बारे में':'About SATHANA 2040'}</h2><p>{t.about}</p><p className="fineprint">{t.disclaimer}</p></div></div>}
    {started&&<div className="corner-tip">{lang==='hi'?'WASD / ऐरो से चलें · निर्माण मोड में जगह चुनें':'WASD / arrows to move · Build mode: select an item, then click open ground'}</div>}
    <footer>PROTOTYPE · FICTIONAL SIMULATION · NOT AN OFFICIAL GOVERNMENT SERVICE</footer>
  </main>
}