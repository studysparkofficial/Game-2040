# SATHANA 2040 — Village Futures

A bilingual (Hindi/English), nonpartisan 3D village-development learning game built with React, Vite, Three.js and React Three Fiber.

## Features
- Third-person 3D village scene and WASD/arrow-key movement
- Explore and build modes
- Placeable water tanks, trees, parks and libraries
- Simulation budget, XP and mission progress
- Hindi/English UI
- Local save using browser localStorage
- Responsive layout for desktop and mobile browsers

## Run locally
Install Node.js 18+ first.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages deployment
This repository is configured for the GitHub Pages project URL `/Sathana-2040/`.

1. Create or use the repository named `Sathana-2040`.
2. Upload the project files (not the containing folder) to the repository root.
3. Run `npm install` and `npm run build` locally to verify.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **GitHub Actions**.
6. Add a workflow at `.github/workflows/deploy.yml` (see below), commit and push.
7. Wait for the Actions workflow to finish. The site URL should be `https://YOUR-USERNAME.github.io/Sathana-2040/`.

If your repository has a different name, update `base` in `vite.config.js` to `/<repository-name>/`.

## Notes
- The map and simulation budget are fictional and illustrative, not a verified survey, official village map, government allocation, approval or promise of construction.
- This is a single-player prototype. Shared online multiplayer/leaderboards require a backend and are not included.
- Three.js dependencies are installed through npm and bundled during build.
