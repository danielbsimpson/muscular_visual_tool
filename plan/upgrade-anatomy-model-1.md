---
goal: Upgrade the ExoView 3D anatomy from procedural primitives to licensed, per-structure anatomical meshes across all four body systems
version: 1.0
date_created: 2026-07-21
last_updated: 2026-07-21
owner: ExoView Maintainers
status: 'Planned'
tags: [upgrade, architecture, 3d, viewer, assets]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

ExoView currently approximates the human body with procedural primitive meshes
(`box`, `sphere`, `capsule`) defined in [`src/viewer/bodyParts.ts`](../src/viewer/bodyParts.ts).
This plan replaces those placeholders with a licensed, anatomically representative 3D model
whose named nodes map to `Structure` ids, covering the `muscular`, `skeletal`, `respiratory`,
and `cardiovascular` systems. The existing interaction pipeline (selection, hover highlight,
layer visibility, opacity peeling, camera fly-to) is keyed on `structureId` and MUST be
preserved without behavioural regression. The procedural mannequin MUST remain as a runtime
fallback when the asset is absent or WebGL is unavailable.

## 1. Requirements & Constraints

- **REQ-001**: Replace procedural primitives with anatomically representative meshes for all four systems: `muscular`, `skeletal`, `respiratory`, `cardiovascular`.
- **REQ-002**: Preserve the existing interaction pipeline keyed by `structureId`: selection, hover highlight (emissive `#38bdf8`), per-system layer visibility, per-system opacity peeling, and camera fly-to.
- **REQ-003**: Every selectable mesh/node MUST resolve to a `Structure.id` present in [`src/data/datasets/structures.json`](../src/data/datasets/structures.json) via [`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json).
- **REQ-004**: Keep the non-WebGL accessible fallback (searchable structure list + info panel) intact and functional.
- **REQ-005**: Keep the 3D scene lazy-loaded and code-split (current `Scene` chunk is loaded on demand via `React.lazy` in [`src/features/explore/ExploreView.tsx`](../src/features/explore/ExploreView.tsx)).
- **REQ-006**: Model assets MUST be served from the app origin under `public/models/` and loaded at runtime, not statically imported into the JS bundle.
- **SEC-001**: Only bundle assets whose license permits redistribution; record source, license, version, and attribution in [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md).
- **SEC-002**: No model or decoder fetched from a third-party origin at runtime; all `.glb`, Draco, and KTX2 decoder files are self-hosted under `public/`.
- **CON-001**: The application remains fully client-side with static assets and no backend.
- **CON-002**: API compatibility with `three@0.169`, `@react-three/fiber@8.17`, `@react-three/drei@9.114`.
- **CON-003**: Coordinate system is metres, `+Y` up, subject facing `+Z`, centred on `X`, with the standing model spanning roughly `y ∈ [0, 1.7]` to match camera defaults in [`src/viewer/Scene.tsx`](../src/viewer/Scene.tsx) (`camera.position = [0, 1.3, 2.2]`, `fov 45`, `OrbitControls.target = [0, 1.1, 0]`, `minDistance 0.6`, `maxDistance 5`).
- **CON-004**: Total compressed model payload target ≤ 8 MB gzip/Draco across all systems; individual system GLB ≤ 3 MB compressed.
- **CON-005**: Vite `chunkSizeWarningLimit` remains `1500`; no new eager import may push the main chunk above its current budget.
- **GUD-001**: Mapping is data-driven through `meshMap.json`; no per-mesh hard-coded conditionals in components.
- **GUD-002**: Progressive enhancement — if the GLB fails to load, the viewer renders the procedural mannequin and logs a single warning.
- **PAT-001**: Load the model once, memoize the parsed scene, and tag each selectable object's `userData.structureId`; use a single delegated raycast/pointer handler on the model root.
- **PAT-002**: Geometry compression via Draco (and optionally meshopt) with decoders self-hosted under `public/decoders/`.
- **PAT-003**: Preserve the `structureId` → geometry indirection so future asset swaps require no component changes.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Source, license-clear, normalize, and compress a per-structure anatomical asset set for all four systems.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Evaluate candidate open-source anatomical sources (Z-Anatomy — CC BY-SA; BodyParts3D/Anatomography — CC BY-SA) for coverage of the 28 structures in [`src/data/datasets/structures.json`](../src/data/datasets/structures.json), mesh separability, and per-structure node naming. Record the decision matrix and the chosen source in [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md). | | |
| TASK-002 | Export/split the chosen asset into named nodes, one selectable node (or node group) per structure, using node names equal to the corresponding `Structure.id` (e.g. `pectoralis-major`, `femur-l`, `femur-r`). Produce per-system GLB files: `public/models/muscular.glb`, `public/models/skeletal.glb`, `public/models/respiratory.glb`, `public/models/cardiovascular.glb`. | | |
| TASK-003 | Normalize transform to CON-003 (metres, `+Y` up, `+Z` facing, `X`-centred, standing height ≈ 1.7 m) in the export tool (Blender/`gltf-transform`); bake a single root transform so no per-mesh offset is required at runtime. | | |
| TASK-004 | Decimate/retopologize meshes and apply Draco geometry compression (and meshopt where beneficial) via `gltf-transform optimize`, meeting CON-004 payload budgets. Store the raw source and the export recipe/command in `docs/MODEL_MAPPING.md` for reproducibility. | | |
| TASK-005 | Add license text and attribution to [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md) and a `public/models/LICENSE.txt`; if the license is share-alike (CC BY-SA), note the obligation and confirm compatibility with the repository license. | | |
| TASK-006 | Self-host decoders: copy the Draco decoder to `public/decoders/draco/` and (if meshopt used) the meshopt decoder to `public/decoders/`. No runtime CDN fetch (SEC-002). | | |

### Implementation Phase 2

- GOAL-002: Build the data-driven model-loading and mesh→structure mapping infrastructure.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Define the mesh map schema and populate [`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json) as `{ "<nodeName>": "<structureId>" }` covering every selectable node across all four GLBs. Add a `system` → GLB-URL manifest at `src/viewer/modelManifest.ts` exporting `MODEL_URLS: Record<SystemId, string>`. | | |
| TASK-008 | Extend viewer types in [`src/viewer/viewer.types.ts`](../src/viewer/viewer.types.ts): add `interface LoadedPart { structureId: string; system: SystemId; objectNames: string[] }` and a `MeshSource = 'procedural' \| 'gltf'` discriminator; keep existing `MeshKind`, `MeshDef`, `BodyPart` for the fallback path. | | |
| TASK-009 | Create `src/viewer/useAnatomyModel.ts`: a hook that loads the per-system GLBs with `useGLTF` (drei) configured with the self-hosted Draco decoder path, memoizes parsed scenes, and returns `{ scenes: Record<SystemId, Group>, ready: boolean, error: Error \| null }`. Register decoder paths once (e.g. `useGLTF.setDecoderPath`/`DRACOLoader.setDecoderPath`). | | |
| TASK-010 | Create `src/viewer/tagStructures.ts` exporting `tagScene(scene: Group, meshMap: Record<string,string>, system: SystemId): void` which traverses the scene, sets `object.userData.structureId` and `object.userData.system` on each node found in `meshMap`, and collects an index `Map<structureId, Object3D[]>` for O(1) lookup. | | |
| TASK-011 | Add build-time preload hints via `useGLTF.preload(url)` for each system URL inside the lazily imported Scene module so decoding starts as soon as the 3D chunk loads. | | |

### Implementation Phase 3

- GOAL-003: Refactor rendering to draw loaded meshes while preserving all interaction behaviour.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Rewrite [`src/viewer/BodyModel.tsx`](../src/viewer/BodyModel.tsx) to render the tagged GLB scenes (via `<primitive object={scene} />` per system) when `useAnatomyModel().ready`, and to fall back to the existing procedural `bodyParts` rendering when `error` is set or a system GLB is missing (GUD-002). | | |
| TASK-013 | Implement a single delegated pointer handler on the model root: on `onPointerDown`, read `event.object.userData.structureId` (walking up parents until found) and call `select(id)`; on `onPointerOver`/`onPointerOut`, call `hover(id)`/`hover(null)`. Replace the current per-mesh handlers while keeping `event.stopPropagation()` semantics. | | |
| TASK-014 | Apply per-system material state without mutating source materials: for each system group set `visible = visibleSystems[system]` and clone/override material `opacity = systemOpacity[system]`, `transparent`, and `depthWrite = opacity > 0.95`, mirroring current [`src/viewer/BodyModel.tsx`](../src/viewer/BodyModel.tsx) logic. Preserve `SYSTEM_COLOR` as a fallback tint only when the asset has no baked material. | | |
| TASK-015 | Implement selection/hover highlight on loaded meshes: for objects whose `userData.structureId` equals `selectedId`/`hoveredId`, apply emissive `#38bdf8` at intensity `0.55`/`0.25` on a cloned material instance; reset on change. Ensure paired structures (`-l`/`-r`) both highlight. | | |
| TASK-016 | Update the viewer barrel [`src/viewer/index.ts`](../src/viewer/index.ts) and [`src/viewer/Scene.tsx`](../src/viewer/Scene.tsx) to mount the loader within `<Suspense>`, showing the existing "Loading 3D view…" fallback while GLBs decode. | | |

### Implementation Phase 4

- GOAL-004: Derive camera framing and focus points from real geometry bounds.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-017 | Create `src/viewer/modelBounds.ts` exporting `getStructureBounds(index: Map<string, Object3D[]>, structureId: string): { center: Vector3; radius: number } \| null`, computing a `Box3` union over the structure's objects. | | |
| TASK-018 | Refactor [`src/viewer/CameraRig.tsx`](../src/viewer/CameraRig.tsx) to consume `modelBounds` when the GLB is loaded (falling back to `getPartCenter` from [`src/viewer/bodyParts.ts`](../src/viewer/bodyParts.ts) otherwise), lerping `controls.target` and `camera.position` toward the bounds center with the existing `0.12` step. | | |
| TASK-019 | Add distance-to-fit behaviour: when a structure is selected, clamp the camera distance so the structure's bounding sphere fits within `fov 45`, respecting `OrbitControls.minDistance 0.6` / `maxDistance 5` from [`src/viewer/Scene.tsx`](../src/viewer/Scene.tsx). | | |
| TASK-020 | Verify `select(null)` (via `onPointerMissed`) returns the camera framing to the default full-body view. | | |

### Implementation Phase 5

- GOAL-005: Meet performance and bundle budgets on mid/low-end devices.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-021 | Confirm assets are runtime-fetched (not bundled): `npm run build` output shows model files copied from `public/models/` unchanged and the JS `Scene` chunk not inflated beyond CON-005. | | |
| TASK-022 | Enable frustum culling and `object.matrixAutoUpdate = false` on static meshes after tagging; use `meshBounds` raycast (drei) or bounding-volume pre-checks to reduce raycast cost (RISK-005). | | |
| TASK-023 | Add a device capability guard: if `renderer.capabilities.isWebGL2 === false` or `dpr`/hardware indicates a low-end device, load a decimated LOD variant (`public/models/<system>-lod.glb`) or fall back to procedural (GUD-002). | | |
| TASK-024 | Measure and record load time and frame time (dev overlay or manual profiling) for a mid-tier device; document results and any tuning in [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md). | | |

### Implementation Phase 6

- GOAL-006: Test, document, and harden the fallback and mapping.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Add `src/viewer/meshMap.test.ts`: assert every value in [`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json) is a `Structure.id` present in `structures.json`, and every structure that declares `meshIds` has at least one node mapping. | | |
| TASK-026 | Add `src/viewer/modelBounds.test.ts`: unit-test `getStructureBounds` with a synthetic tagged `Group` (returns center for a known id, `null` for unknown). | | |
| TASK-027 | Add `src/viewer/BodyModel.test.tsx`: mock `useAnatomyModel`/`useGLTF` to render a synthetic tagged scene and assert pointer-down on a tagged object calls `select` with the correct `structureId`, and that the procedural fallback renders when the mock reports `error`. | | |
| TASK-028 | Update [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md): replace the "procedural mannequin (M1)" current-state section with the new asset source/license/version, the `meshMap.json` schema, the decoder setup, and the export recipe. | | |
| TASK-029 | Run the full verification gate and record results: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all green; browser smoke test confirms selection, hover, layer toggles, opacity, camera fly-to, and cross-links still work in Explore. | | |
| TASK-030 | Update [`implementation_plan.md`](../implementation_plan.md) M1 model note and any roadmap references to reflect that the anatomical model has replaced the placeholder. | | |

## 3. Alternatives

- **ALT-001**: Keep procedural primitives and only refine their shapes/counts. Rejected — cannot achieve anatomical realism or credible per-structure boundaries required by REQ-001.
- **ALT-002**: Integrate a commercial anatomy SDK (e.g. BioDigital Human). Rejected — licensing cost and reliance on hosted services violate CON-001 (client-side/offline) and SEC-002.
- **ALT-003**: Stream models from a backend/CDN service. Rejected — conflicts with CON-001 and the self-hosting requirement SEC-002.
- **ALT-004**: Ship one monolithic GLB for all systems. Considered but deferred — per-system GLBs (chosen) allow independent lazy-loading, smaller initial payloads, and cleaner layer toggling; a single file can be revisited if request overhead dominates.
- **ALT-005**: Use per-structure individual mesh files loaded on demand. Deferred — high request count and mapping overhead; may be adopted selectively for deep-dive structures post-MVP.

## 4. Dependencies

- **DEP-001**: `three@0.169` — `GLTFLoader`, `DRACOLoader`, `KTX2Loader`, `Box3`, `Vector3` (already installed).
- **DEP-002**: `@react-three/drei@9.114` — `useGLTF`, `useGLTF.preload`, `meshBounds`, `Bounds` (already installed).
- **DEP-003**: `@react-three/fiber@8.17` — `<primitive>`, `useFrame`, `useThree` (already installed).
- **DEP-004**: Self-hosted Draco decoder (and optional meshopt decoder) placed under `public/decoders/` (no new npm dependency).
- **DEP-005**: Dev-time asset tooling: Blender and/or `@gltf-transform/cli` for splitting, normalizing, decimating, and Draco-compressing the source asset (dev dependency / external tool, not shipped).
- **DEP-006**: A license-cleared anatomical source asset (Z-Anatomy CC BY-SA or BodyParts3D CC BY-SA), vetted in TASK-001.

## 5. Files

- **FILE-001**: `public/models/{muscular,skeletal,respiratory,cardiovascular}.glb` — new per-system Draco-compressed anatomical assets (plus optional `*-lod.glb`).
- **FILE-002**: `public/models/LICENSE.txt` — asset license and attribution.
- **FILE-003**: `public/decoders/draco/` (and optional meshopt decoder) — self-hosted decoders.
- **FILE-004**: [`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json) — node-name → `structureId` lookup (currently `{}`).
- **FILE-005**: `src/viewer/modelManifest.ts` — new `MODEL_URLS: Record<SystemId, string>` manifest.
- **FILE-006**: `src/viewer/useAnatomyModel.ts` — new GLB-loading/memoizing hook.
- **FILE-007**: `src/viewer/tagStructures.ts` — new scene-tagging + structure index utility.
- **FILE-008**: `src/viewer/modelBounds.ts` — new bounds/center computation from loaded geometry.
- **FILE-009**: [`src/viewer/viewer.types.ts`](../src/viewer/viewer.types.ts) — add `LoadedPart` and `MeshSource` types.
- **FILE-010**: [`src/viewer/BodyModel.tsx`](../src/viewer/BodyModel.tsx) — render loaded meshes with delegated picking/highlight/layer/opacity; procedural fallback.
- **FILE-011**: [`src/viewer/CameraRig.tsx`](../src/viewer/CameraRig.tsx) — bounds-driven fly-to and fit.
- **FILE-012**: [`src/viewer/Scene.tsx`](../src/viewer/Scene.tsx) / [`src/viewer/index.ts`](../src/viewer/index.ts) — Suspense wiring and barrel exports.
- **FILE-013**: [`src/viewer/bodyParts.ts`](../src/viewer/bodyParts.ts) — retained as the fallback source of geometry and `getPartCenter`.
- **FILE-014**: [`docs/MODEL_MAPPING.md`](../docs/MODEL_MAPPING.md) — updated source/license/mapping/recipe documentation.
- **FILE-015**: `src/viewer/meshMap.test.ts`, `src/viewer/modelBounds.test.ts`, `src/viewer/BodyModel.test.tsx` — new tests.
- **FILE-016**: [`implementation_plan.md`](../implementation_plan.md) — roadmap/model-note update.

## 6. Testing

- **TEST-001**: `meshMap.json` integrity — every mapped value is a `Structure.id` in `structures.json`; every structure with non-empty `meshIds` has ≥1 node mapping (TASK-025).
- **TEST-002**: `getStructureBounds` returns a `{ center, radius }` for a known tagged structure and `null` for an unknown id (TASK-026).
- **TEST-003**: `BodyModel` pointer-down on a tagged object dispatches `select(structureId)`; hover dispatches `hover(structureId)`/`hover(null)` (TASK-027).
- **TEST-004**: Fallback path — when the loader reports `error` or a system GLB is absent, `BodyModel` renders the procedural mannequin and no uncaught error is thrown (TASK-027).
- **TEST-005**: Layer/opacity — toggling a system sets group `visible`; opacity slider changes material `opacity` and `depthWrite` threshold (component test or manual browser smoke).
- **TEST-006**: Build/bundle budget — `npm run build` succeeds, model files are emitted from `public/` unchanged, and the `Scene` JS chunk stays within CON-005 (TASK-021).
- **TEST-007**: Regression gate — `npm run typecheck`, `npm run lint`, `npm test` all green; browser confirms selection, highlight, layer toggle, opacity, camera fly-to, search, and structure↔exercise cross-links unaffected (TASK-029).

## 7. Risks & Assumptions

- **RISK-001**: License incompatibility or attribution burden of the chosen asset. Mitigation: vet in TASK-001, prefer permissive/compatible licenses, document obligations (SEC-001, TASK-005).
- **RISK-002**: Asset too heavy for target devices, hurting load/frame time. Mitigation: decimation, Draco/meshopt, per-system splitting, LOD variants (TASK-004, TASK-023, CON-004).
- **RISK-003**: Source node names do not match `structureId`s, making mapping tedious/error-prone. Mitigation: rename nodes on export and use data-driven `meshMap.json` with an integrity test (TASK-002, TASK-007, TASK-025).
- **RISK-004**: Scale/orientation mismatch with camera defaults. Mitigation: bake normalization on export and validate against CON-003 (TASK-003, TASK-020).
- **RISK-005**: Raycasting across dense meshes degrades interaction performance. Mitigation: delegated single handler, `meshBounds`/bounding-volume pre-checks, culling (TASK-013, TASK-022).
- **RISK-006**: Material overrides mutate shared source materials causing cross-highlight bleed. Mitigation: clone materials per selectable object before overriding (TASK-014, TASK-015).
- **ASSUMPTION-001**: A license-cleared source provides separable meshes for the 28 current structures across all four systems, or acceptable groupings thereof.
- **ASSUMPTION-002**: Target browsers support WebGL2; devices without it or without the asset use the existing procedural/non-3D fallback (REQ-004, GUD-002).
- **ASSUMPTION-003**: The set of structures in `structures.json` is stable during this upgrade; new structures are added via the same `meshMap.json` mechanism.

## 8. Related Specifications / Further Reading

- [ExoView Implementation Plan](../implementation_plan.md)
- [Model → structure mapping (docs/MODEL_MAPPING.md)](../docs/MODEL_MAPPING.md)
- [Project Brief (docs/PROJECT_BRIEF.md)](../docs/PROJECT_BRIEF.md)
- [three.js GLTFLoader documentation](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [three.js DRACOLoader documentation](https://threejs.org/docs/#examples/en/loaders/DRACOLoader)
- [@react-three/drei useGLTF](https://github.com/pmndrs/drei#usegltf)
- [glTF-Transform (asset optimization)](https://gltf-transform.dev/)
- [Z-Anatomy (CC BY-SA anatomical model)](https://www.z-anatomy.com/)
- [BodyParts3D / Anatomography (CC BY-SA)](https://lifesciencedb.jp/bp3d/)
