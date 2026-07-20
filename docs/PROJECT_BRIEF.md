# ExoView — Project Brief

> Working concept document. This is the source of truth used to derive
> [`README.md`](../README.md) and [`implementation_plan.md`](../implementation_plan.md).

## 1. Vision

ExoView is an interactive, browser-based tool that lets anyone **visualize the human
body in 3D** and understand how their training affects it. Users explore muscles,
bones, and the respiratory and cardiovascular systems; zoom into any structure to see
its name and key facts; discover evidence-based exercises that develop each area; and
plan a weekly workout to see — via a **heat map** — exactly which structures they are
targeting and where they should expect growth or soreness.

The goal is to connect **anatomy → training → science** in one continuous experience:

1. **See it** — a 3D model of the body with selectable systems and structures.
2. **Understand it** — names, plain-language descriptions, and functional notes.
3. **Train it** — curated exercises, variations, and techniques per structure.
4. **Prove it** — linked scientific studies explaining *why* those exercises work.
5. **Plan it** — a 7-day routine builder that highlights targeted areas as a heat map.

## 2. Target Audience

Broad, spanning three overlapping groups:

- **General fitness enthusiasts** — want to know what a workout actually trains.
- **Athletes / advanced trainees** — want technique variations and evidence.
- **Students / educational users** — want anatomy learning with an interactive model.

The UI must stay approachable for beginners while offering depth (studies, variations,
technique cues) for advanced users.

## 3. Core Systems (all in scope, phased)

| System | Priority | Example structures |
| --- | --- | --- |
| Muscular | 1 | Pectoralis major, quadriceps, latissimus dorsi, biceps brachii |
| Skeletal | 1 | Femur, spine, humerus, pelvis |
| Respiratory | 2 | Lungs, diaphragm, intercostals |
| Cardiovascular / Vascular | 2 | Heart, major arteries/veins |

Each system can be toggled independently and layered (e.g., muscles over bones).

## 4. Key Features

### 4.1 Interactive 3D Body
- Rotate, pan, and zoom a 3D human model (Three.js / WebGL).
- Toggle systems on/off and adjust opacity to peel back layers.
- Click/tap a structure to select it and open an info panel.
- Search for a structure by name and fly the camera to it.

### 4.2 Structure Info
- Name (common + anatomical), plain-language description, function.
- Related structures (antagonist muscle, attached bones, etc.).
- Links to relevant exercises and studies.

### 4.3 Exercise Library
- Exercises tagged with the structures they target (primary / secondary).
- Technique cues, common mistakes, and variations (easier / harder / alternate).
- Training focus tags: hypertrophy, strength, bone density, VO₂max, breath work.
- Each exercise references one or more scientific studies.

### 4.4 Scientific Studies
- Curated, static references: title, authors, year, source link, and a short summary
  of the finding and *why it matters* for the linked structure/exercise.
- Displayed contextually from structures and exercises.

### 4.5 Weekly Routine Planner + Heat Map
- 7-day grid; add exercises to each day.
- Aggregates targeted structures across the week.
- Renders a **heat map** onto the 3D model showing training volume/intensity per area.
- Surfaces likely growth/soreness zones and highlights under-trained areas.

## 5. Design Principles

- **Client-first**: fully functional offline; no login required for the MVP.
- **Evidence-linked**: training claims connect to a citable source.
- **Progressive disclosure**: simple by default, deep on demand.
- **Accessible**: keyboard navigation, labels, and a non-3D fallback list view.
- **Fast**: models and data lazy-loaded; smooth interaction on mid-range devices.

## 6. Technical Direction

- **Platform**: Web app first; architected to extend to mobile later.
- **Stack**: React + TypeScript + Three.js (via `@react-three/fiber` + `drei`).
- **State/Data**: fully client-side — static JSON datasets + local persistence
  (IndexedDB/localStorage) for saved routines.
- **Offline**: installable **PWA** with cached assets and data.
- **No backend for MVP**: data layer abstracted so a future API/DB can slot in.
- **Assets/Data**: free / open-source anatomy models and datasets; start with a small
  curated set of major structures and expand.

## 7. Data Model (high level)

- `Structure` — id, system, names, description, function, relations, mesh mapping.
- `Exercise` — id, name, targeted structure ids (primary/secondary), focus tags,
  cues, mistakes, variations, study ids.
- `Study` — id, title, authors, year, url, summary, relevance note.
- `RoutineDay` / `Routine` — days → exercise ids; derived structure-volume map.

## 8. MVP Scope & Phasing

All three pillars ship, phased across milestones:

1. **M1 — Explore**: 3D model, system toggles, select structure, info panel (muscular +
   skeletal). Search and non-3D fallback.
2. **M2 — Train**: exercise library linked to structures; studies; respiratory +
   cardiovascular systems.
3. **M3 — Plan**: weekly routine planner, heat map, saved routines, PWA/offline.

## 9. Open Questions / Future

- Source and licensing of the specific 3D model(s) to standardize on.
- Depth of the initial curated dataset (how many structures/exercises for M1?).
- Future: user accounts + sync, community routines, wearable/VO₂max data import,
  animated exercise demonstrations.

## 10. Non-Goals (for now)

- Medical or diagnostic advice.
- Backend, authentication, or multi-device sync (designed for, not built).
- Exhaustive full-body anatomy — curated coverage first, breadth later.
