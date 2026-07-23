# Model → structure mapping

Documents the 3D model source, license, and how mesh/node names map to `Structure` ids.

## Rendering pipeline

The viewer loads **per-system anatomical GLB assets** at runtime and, when they are
unavailable, falls back to a **procedural mannequin**. Both paths are keyed on
`structureId`, so selection, hover highlighting, layer visibility, opacity peeling, and
camera fly-to behave identically regardless of the underlying geometry (REQ-002).

Loading is orchestrated by:

- [`src/viewer/modelManifest.ts`](../src/viewer/modelManifest.ts) — per-system GLB URLs
  (`MODEL_URLS`), the self-hosted Draco decoder path (`DRACO_DECODER_PATH`), and the
  `MODELS_ENABLED` switch.
- [`src/viewer/useAnatomyModel.ts`](../src/viewer/useAnatomyModel.ts) — loads and memoizes
  the GLBs with `GLTFLoader` + `DRACOLoader`, returning `{ scenes, index, ready, error }`.
- [`src/viewer/tagStructures.ts`](../src/viewer/tagStructures.ts) — tags each mapped node's
  `userData.structureId`/`system` and builds a `structureId → Object3D[]` index.
- [`src/viewer/BodyModel.tsx`](../src/viewer/BodyModel.tsx) — renders the tagged scenes with a
  single delegated pointer handler; renders the procedural mannequin when `ready` is false.
- [`src/viewer/modelBounds.ts`](../src/viewer/modelBounds.ts) /
  [`src/viewer/CameraRig.tsx`](../src/viewer/CameraRig.tsx) — derive camera framing from real
  geometry bounds (falling back to `getPartCenter`).

> **Progressive enhancement (GUD-002):** if a GLB fails to load, the viewer logs a single
> warning and renders the procedural mannequin. While `MODELS_ENABLED` is `false` (the default
> until real assets are added) no assets are fetched at all.

## Mesh map schema

[`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json) is a flat lookup:

```json
{ "<nodeName>": "<structureId>" }
```

- Every **key** is a GLB node name. By convention, central parts use `<structureId>` and
  mirrored parts use `<structureId>-l` / `<structureId>-r` (e.g. `femur-l`, `femur-r`).
- Every **value** must be a `Structure.id` present in
  [`src/data/datasets/structures.json`](../src/data/datasets/structures.json).

This mapping is data-driven (GUD-001); no per-mesh conditionals live in components. Its
integrity is enforced by [`src/viewer/meshMap.test.ts`](../src/viewer/meshMap.test.ts).

## Procedural fallback (mannequin)

The fallback approximates the body with primitive meshes (boxes, spheres, capsules) defined
in [`src/viewer/bodyParts.ts`](../src/viewer/bodyParts.ts). It requires no external asset or
license — the geometry is generated in code.

- **Coordinate system:** metres, +Y up, subject facing +Z, centred on X.
- **Naming:** central parts use `<structureId>`; mirrored parts use `<structureId>-l` / `-r`.

## Anatomical GLB assets (source, license, recipe)

The GLB binaries are produced **offline** and placed under `public/models/`; they are not
committed to the repository (see [`public/models/LICENSE.txt`](../public/models/LICENSE.txt)).

- **Source:** _to be finalized_ — Z-Anatomy (CC BY-SA) or BodyParts3D / Anatomography
  (CC BY-SA). Record the chosen source, license, version, and attribution in
  `public/models/LICENSE.txt` before distributing any asset (SEC-001).
- **License note:** both candidate sources are **share-alike (CC BY-SA)**; derived assets must
  carry the same license and attribution.
- **Coordinate system (CON-003):** metres, +Y up, +Z facing, X-centred, standing height ≈ 1.7 m,
  with a single baked root transform (no per-mesh runtime offset).
- **Budgets (CON-004):** ≤ 8 MB total compressed across all systems; each per-system GLB
  ≤ 3 MB compressed.

### Export recipe

1. In Blender / `gltf-transform`, split the source into named nodes — one selectable node (or
   group) per structure — renaming nodes to match the `meshMap.json` keys.
2. Produce four per-system files: `public/models/{muscular,skeletal,respiratory,cardiovascular}.glb`.
3. Normalize the transform to CON-003 and bake a single root transform.
4. Decimate/retopologize and apply Draco (and optionally meshopt) compression, e.g.:

   ```bash
   gltf-transform optimize in.glb muscular.glb --compress draco
   ```

5. Set `MODELS_ENABLED = true` in
   [`src/viewer/modelManifest.ts`](../src/viewer/modelManifest.ts).

### Draco decoder (self-hosted, SEC-002)

The loader reads the decoder from `/decoders/draco/`. Copy the decoder from the installed
`three` package into `public/decoders/draco/` — see
[`public/decoders/draco/README.md`](../public/decoders/draco/README.md). No decoder is fetched
from a third-party origin at runtime.

## Candidate open-source sources (to evaluate)

- Z-Anatomy (CC BY-SA) — Blender-based, fully labelled anatomy.
- BodyParts3D / Anatomography (CC BY-SA) — per-structure meshes.

> Confirm licensing and attribution requirements before bundling any asset.


