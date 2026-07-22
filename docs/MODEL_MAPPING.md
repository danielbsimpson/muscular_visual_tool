# Model → structure mapping

Documents the 3D model source, license, and how mesh/node names map to `Structure` ids.

## Current model (M1): procedural mannequin

M1 does **not** use an external anatomical asset. Instead, the body is approximated by
primitive meshes (boxes, spheres, capsules) defined in
[`src/viewer/bodyParts.ts`](../src/viewer/bodyParts.ts). Each `BodyPart` declares:

- `structureId` — links the geometry to an entry in
  [`src/data/datasets/structures.json`](../src/data/datasets/structures.json).
- `system` — `muscular` or `skeletal` (drives layer toggles and colour).
- `meshes[]` — primitive definitions with position/rotation/args.

Selection, hover highlighting, layer visibility, opacity peeling, and camera focus are all
driven by `structureId`, so the interaction pipeline is independent of the underlying geometry.

- **License:** none required — geometry is generated in code.
- **Coordinate system:** metres, +Y up, subject facing +Z, centred on X.
- **Naming:** central parts use `<structureId>`; mirrored parts use `<structureId>-l` / `-r`.

## Swapping in a real anatomical model (future)

To replace the placeholder with a rigged model (e.g. a `.glb`):

1. Add the asset under `public/models/` and record its **source and license** here.
2. Give each selectable mesh/node a name matching a `Structure.id` (or maintain a lookup in
   [`src/data/datasets/meshMap.json`](../src/data/datasets/meshMap.json)).
3. Load it in the viewer and tag each mesh's `userData.structureId`; the existing selection,
   highlight, layer, and camera systems continue to work unchanged.

## Candidate open-source sources (to evaluate)

- Z-Anatomy (CC BY-SA) — Blender-based, fully labelled anatomy.
- BodyParts3D / Anatomography (CC BY-SA) — per-structure meshes.

> Confirm licensing and attribution requirements before bundling any asset.

