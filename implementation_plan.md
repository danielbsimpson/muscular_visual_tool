# ExoView — Implementation Plan

This document breaks the [Project Brief](docs/PROJECT_BRIEF.md) into concrete
milestones, tasks, and technical decisions. It is the working roadmap; check items off
as they land.

---

## 1. Guiding Principles

- **Client-first & offline-capable** — everything runs in the browser; installable PWA.
- **Data-driven** — anatomy, exercises, and studies live in versioned JSON, not code.
- **Abstract the data layer** — a repository interface so a future backend can drop in.
- **Progressive disclosure** — simple default UI, depth on demand.
- **Accessible & performant** — keyboard support, a non-3D fallback, and lazy loading.

## 2. Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                        UI (React)                        │
│  Explore · Exercises · Weekly Planner · Info Panels      │
├────────────────────────────────────────────────────────┤
│                    3D Viewer (r3f)                       │
│  Scene · Camera · Structure picking · Heat map overlay   │
├────────────────────────────────────────────────────────┤
│                     App State                            │
│  Selection · Layer toggles · Routine · Derived heat map  │
├────────────────────────────────────────────────────────┤
│                  Data Layer (repository)                 │
│  Structures · Exercises · Studies (static JSON now)      │
├────────────────────────────────────────────────────────┤
│              Persistence (IndexedDB/localStorage)        │
└────────────────────────────────────────────────────────┘
```

### 2.1 Tech Choices

| Concern | Choice |
| --- | --- |
| Language | TypeScript (strict) |
| UI | React 18 |
| Build/dev | Vite |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` |
| State | Zustand (lightweight, testable) |
| Persistence | IndexedDB via `idb` (fallback to localStorage) |
| PWA | `vite-plugin-pwa` (Workbox) |
| Testing | Vitest + React Testing Library; Playwright for e2e |
| Lint/format | ESLint + Prettier |
| CI | GitHub Actions (lint, typecheck, test, build) |

## 3. Data Model

TypeScript interfaces (initial draft — refine during M1):

```ts
type SystemId = 'muscular' | 'skeletal' | 'respiratory' | 'cardiovascular';
type FocusTag = 'hypertrophy' | 'strength' | 'boneDensity' | 'vo2max' | 'breathWork'
              | 'mobility' | 'endurance';

interface Structure {
  id: string;                 // e.g. "pectoralis-major"
  system: SystemId;
  name: string;               // common name
  anatomicalName?: string;    // Latin/anatomical
  description: string;        // plain-language
  function: string;
  meshIds: string[];          // node/mesh names in the 3D model
  relatedStructureIds?: string[];
  exerciseIds?: string[];
  studyIds?: string[];
}

interface ExerciseTarget { structureId: string; role: 'primary' | 'secondary'; }
interface ExerciseVariation { id: string; name: string; note: string; difficulty: 'easier' | 'harder' | 'alternate'; }

interface Exercise {
  id: string;
  name: string;
  focus: FocusTag[];
  targets: ExerciseTarget[];
  cues: string[];             // technique cues
  commonMistakes: string[];
  variations: ExerciseVariation[];
  studyIds: string[];
}

interface Study {
  id: string;
  title: string;
  authors: string;
  year: number;
  url: string;
  summary: string;            // the finding
  relevance: string;          // why it matters here
}

interface RoutineDay { day: number; exerciseIds: string[]; }        // day 0–6
interface Routine { id: string; name: string; days: RoutineDay[]; updatedAt: number; }
```

The **heat map** is derived: aggregate `Exercise.targets` across all `RoutineDay`s,
weighting `primary` > `secondary`, to produce a per-structure intensity score mapped to
mesh colors.

### 3.1 Data Repository Interface

```ts
interface DataRepository {
  getStructures(system?: SystemId): Promise<Structure[]>;
  getStructure(id: string): Promise<Structure | undefined>;
  getExercises(structureId?: string): Promise<Exercise[]>;
  getStudies(ids: string[]): Promise<Study[]>;
}
```

M1 implements `StaticJsonRepository`. A future `ApiRepository` can implement the same
interface without touching UI code.

## 4. Milestones

### M0 — Project Setup (foundation)
- [x] Scaffold Vite + React + TypeScript project.
- [x] Configure ESLint, Prettier, strict `tsconfig`.
- [x] Add Vitest + React Testing Library; a smoke test.
- [x] Set up GitHub Actions CI (lint, typecheck, test, build).
- [x] Base app shell: layout, routing (Explore / Exercises / Planner), theming.
- [x] Define shared `types/` and the `DataRepository` interface.

**Exit criteria:** `npm run dev` boots the shell; CI green.

### M1 — Explore (muscular + skeletal)
- [x] Integrate `@react-three/fiber` scene: lighting, orbit controls, camera.
- [x] Load a base 3D body model (muscular + skeletal); document source/license.
      *(M1 uses a procedural primitive "mannequin"; see docs/MODEL_MAPPING.md. A rigged
      asset can swap in later via the same structure-id mapping.)*
- [x] Map model meshes → `Structure` ids (`meshIds`).
- [x] System layer toggles + opacity (peel muscles off bones).
- [x] Structure picking (click/tap) → highlight + selection state.
- [x] Info panel: name, anatomical name, description, function, relations.
- [x] Search structures by name → fly camera to structure.
- [x] Accessible fallback: searchable structure list + info panel (no WebGL required).
- [x] Curated M1 dataset: major muscles + bones.

**Exit criteria:** user can explore, select, and read about muscular & skeletal
structures in 3D and via the fallback list.

### M2 — Train (exercises, studies, more systems)
- [x] Add respiratory + cardiovascular structures to model & data.
- [x] Exercise library UI: list, filter by focus tag and by targeted structure.
- [x] Exercise detail: cues, common mistakes, variations, targeted structures.
- [x] Cross-linking: structure → exercises, exercise → structures.
- [x] Studies: curated dataset + contextual display from structures & exercises.
- [x] Focus-tag support for boneDensity, vo2max, breathWork.

**Exit criteria:** every exercise links to structures and ≥1 study; all four systems
are viewable.

### M3 — Plan (routine planner + heat map + PWA)
- [ ] 7-day planner grid; add/remove/reorder exercises per day.
- [ ] Derive per-structure weekly intensity from the routine.
- [ ] Heat map overlay on the 3D model (color scale + legend).
- [ ] Highlight under-trained / over-trained areas; soreness/growth hints.
- [ ] Persist routines (IndexedDB) + create/rename/delete/duplicate.
- [ ] PWA: manifest, service worker, offline caching of app + data + models.
- [ ] Import/export routine as JSON.

**Exit criteria:** user builds a weekly routine offline and sees an accurate heat map.

### Post-MVP (backlog)
- [ ] User accounts + cloud sync (`ApiRepository`).
- [ ] Animated exercise demonstrations.
- [ ] Community/shared routines.
- [ ] Wearable / VO₂max data import.
- [ ] Expanded anatomy coverage (deeper structures).
- [ ] Mobile app packaging (Capacitor or native shell).

## 5. Cross-Cutting Concerns

- **Accessibility**: keyboard navigation, ARIA labels, focus management, color-blind-safe
  heat map palette, and the non-3D fallback view.
- **Performance**: lazy-load models/datasets, draco/meshopt compression, memoized
  selectors, and instanced highlighting.
- **Testing**: unit tests for data selectors & heat map math; component tests for panels
  and planner; Playwright e2e for core flows.
- **Docs**: keep `docs/` updated (data schema, model-mesh mapping, contribution guide).
- **Licensing**: record the license/source of every 3D asset and dataset in `docs/`.

## 6. Immediate Next Steps

1. Confirm the specific open-source 3D body model to standardize on (source + license).
2. Decide the M1 curated dataset size (target count of muscles + bones).
3. Execute **M0** scaffold and CI.
4. Begin **M1** viewer integration.

## 7. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Quality/licensing of free 3D models | Vet sources early; abstract model loading; document licenses |
| Mesh → structure mapping is tedious | Build a small in-app mapping/debug tool; store mapping as data |
| Performance on low-end devices | Compress models, LOD, fallback list view |
| Scope creep across three pillars | Strict milestone exit criteria; backlog for extras |
| Accuracy of training/heat-map claims | Tie claims to studies; label heat map as an estimate |
