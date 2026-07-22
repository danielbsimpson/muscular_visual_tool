<div align="center">

<img src="public/favicon.svg" alt="ExoView logo" width="88" height="88" />

# ExoView

**Visualize your body. Understand your training.**

Interactive, browser-based 3D tool for exploring human anatomy and planning evidence-based training.

![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r169-000000?logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?logo=pwa&logoColor=white)

</div>

ExoView lets you rotate, zoom, and peel through the layers of the human body to learn what
each structure is and how it works, discover exercises that develop it, read the science
behind them, and (soon) plan a week of training with a muscle **heat map**. It runs entirely
in the browser — no account, no backend.

> [!NOTE]
> ExoView is under active development. The **Explore** and **Train** experiences are
> functional; the **Plan** experience (weekly routine + heat map + offline PWA) is next.
> See [`implementation_plan.md`](implementation_plan.md) for the roadmap.

## Features

- **Interactive 3D body** — orbit, pan, and zoom; toggle body systems on and off and adjust per-system opacity to peel muscles off bones.
- **Explore structures** — click any structure for its name, anatomical name, description, and function; search by name and let the camera fly to it. A fully accessible list works even without WebGL.
- **Exercise library** — exercises linked to the structures they target, with technique cues, common mistakes, and easier/harder variations, filterable by training focus and target.
- **Backed by science** — exercises cite curated, real studies explaining *why* they work, shown in context from both structures and exercises.
- **Bidirectional cross-linking** — jump from a structure to the exercises that train it, and from an exercise to the anatomy it targets.
- **Installable PWA** *(planned)* — a weekly planner and heat map that work offline.

## Body systems

| System | Structures | Status |
| --- | --- | --- |
| Muscular | Trapezius, deltoids, pectorals, biceps, triceps, abs, lats, glutes, quads, hamstrings, calves… | Available |
| Skeletal | Skull, spine, rib cage, clavicle, humerus, pelvis, femur, tibia & fibula… | Available |
| Respiratory | Lungs, diaphragm, trachea | Available |
| Cardiovascular | Heart, aorta, vascular network | Available |

> [!NOTE]
> The current 3D model is a lightweight **procedural mannequin** that stands in for a full
> anatomical asset — the interaction pipeline is keyed on structure ids, so a real model can
> drop in without app changes. See [`docs/MODEL_MAPPING.md`](docs/MODEL_MAPPING.md) and the
> upgrade plan in [`plan/upgrade-anatomy-model-1.md`](plan/upgrade-anatomy-model-1.md).

## Tech stack

- **UI**: React 18 + TypeScript (strict)
- **3D**: Three.js via [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) and [`@react-three/drei`](https://github.com/pmndrs/drei)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: React Router
- **Build/dev**: Vite
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (e2e)
- **Data**: static JSON datasets behind a repository interface — fully client-side, with a future API able to drop in

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) 20+ and npm.

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev
```

Open http://localhost:5173 and start exploring. The 3D scene is code-split and loads on
demand; where WebGL is unavailable, the accessible structure list takes over.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run typecheck` | Run the TypeScript compiler (app + node configs). |
| `npm run lint` | Lint the codebase with ESLint. |
| `npm run format` | Format the codebase with Prettier. |
| `npm test` | Run the unit and component test suite once. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run test:e2e` | Run the Playwright end-to-end tests. |

## Project structure

```
exoview/
├── docs/                  # Concept, data schema, model mapping, contributing
├── e2e/                   # Playwright end-to-end tests
├── plan/                  # Detailed implementation plans
├── public/                # Static assets, PWA manifest, icons, 3D models
├── src/
│   ├── components/        # Shared UI (Header, Layout, SearchBar, InfoPanel, StudyCard…)
│   ├── data/              # Repository interface + static JSON datasets
│   │   └── datasets/      # structures, exercises, studies, meshMap
│   ├── features/          # Explore, Exercises, Planner views
│   ├── hooks/             # Data loading + capability hooks
│   ├── state/             # Zustand viewer store
│   ├── types/             # Shared TypeScript models
│   └── viewer/            # 3D scene, body model, camera rig, layer controls
├── implementation_plan.md # Roadmap & milestones
└── index.html
```

## How it works

ExoView is data-driven. Anatomy, exercises, and studies live in versioned JSON under
[`src/data/datasets`](src/data/datasets) and are read through a `DataRepository` interface,
so the UI never talks to a data source directly. Each 3D structure carries a `structureId`
that ties geometry, selection, highlighting, layer visibility, and camera focus together —
the same id used to cross-link exercises and studies.

See [`docs/DATA_SCHEMA.md`](docs/DATA_SCHEMA.md) for the data model and
[`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md) for the full concept.

## Roadmap

- [x] **M1 — Explore**: 3D viewer, system toggles/opacity, structure selection & info, search, accessible fallback (muscular + skeletal).
- [x] **M2 — Train**: exercise library with filters, exercise detail, curated studies, cross-linking, respiratory & cardiovascular systems.
- [ ] **M3 — Plan**: 7-day routine planner, derived muscle heat map, saved routines (IndexedDB), and offline PWA.

Full details and exit criteria are in [`implementation_plan.md`](implementation_plan.md).

## Contributing

Contributions of code, anatomy data, exercises, and studies are welcome — see
[`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

> [!WARNING]
> ExoView is an educational and planning tool. It does **not** provide medical, diagnostic,
> or personalized health advice. Consult a qualified professional before starting any new
> exercise program.
