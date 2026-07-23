# Anatomical 3D Viewer — Implementation Plan

**Approach:** Fast POC on pre-built assets (`esma-dev-studio/anatomy-3d-viewer`), then migrate geometry to the higher-provenance source (`Kevin-Mattheus-Moerman/BodyParts3D`) via a pure-Python conversion pipeline for the production build.

---

## Phase 0 — Setup & Licensing Baseline (0.5–1 week)

**Goal:** De-risk legal/provenance questions before writing product code.

- [ ] Clone both repos read-only; do not redistribute yet.
  - `esma-dev-studio/anatomy-3d-viewer` (viewer + pre-built glb assets)
  - `Kevin-Mattheus-Moerman/BodyParts3D` (raw STL, FMA-indexed)
- [ ] Record license chain in a `THIRD_PARTY_NOTICES.md`:
  - BodyParts3D content — CC BY‑SA 2.1 Japan (DBCLS)
  - HuBMAP Human Reference Atlas (organs, if reused) — CC BY 4.0
  - Viewer repo code — check actual LICENSE file, not just README
  - BodyParts3D repo code (Julia tooling) — MIT
- [ ] Draft the attribution string that must ship in-app (about page / footer), per CC BY‑SA + CC BY 4.0 requirements.
- [ ] Set up local Python env for asset pipeline: `pip install trimesh --break-system-packages` (plus `numpy`, `pygltflib` as trimesh deps pull in).
- [ ] Confirm which domains/tools are actually available in your target *deployment* environment vs. the authoring/build environment — this determines whether Phase 2's conversion runs in CI, locally, or has to be pre-baked and checked into the repo.

**Exit criteria:** legal chain documented, environments provisioned, no code written yet.

---

## Phase 1 — POC: Fast Path on Pre-Built Assets (1–2 weeks)

**Goal:** Prove the interaction model (layer toggling, part selection, labels, isolate view) works for your product, without betting engineering time on asset provenance yet.

1. **Vendor only the assets, not the app**, from `anatomy-3d-viewer`:
   - `public/draco/` (self-hosted Draco decoder — avoids CDN dependency)
   - `skeleton glb`, `muscles.glb`, `organs.glb`
   - `src/data/skeletonMap.ts`, `src/data/muscleMap.ts` (mesh-name → part-ID mapping)
2. **Build minimal viewer** in your own stack (React Three Fiber recommended, matches the source mapping files):
   - `<Canvas>` + `useGLTF` with local `DRACOLoader` pointed at vendored decoder
   - Layer toggle state (skin / skeleton / muscle / organ)
   - Click-to-select using the mesh-name mapping tables
   - Basic isolate / highlight / fade-others interaction
3. **Stub the licensing footer** using the Phase 0 attribution string (even in POC — don't let it become a habit to skip).
4. **Get product/stakeholder sign-off** on the interaction model itself, independent of asset quality.

**Deliverable:** clickable internal demo, not for external distribution (given the viewer repo's unverified 0-star provenance — treat this phase as *internal validation only*).

**Exit criteria:** stakeholders approve the UX; you know exactly which anatomical structures/layers the product actually needs (you likely won't need all 300+ meshes — scope this down now).

---

## Phase 2 — Provenance Migration: BodyParts3D via Python Pipeline (2–4 weeks)

**Goal:** Replace POC geometry with assets you can legally and technically stand behind, sourced from the better-provenanced, 112-star repo.

### 2.1 — Scoping
- [ ] From the Phase 1 POC, list the exact FMA IDs / structures actually used (bones, muscles, organs shown). Cross-reference against `Kevin-Mattheus-Moerman/BodyParts3D`'s `assets/*.txt` FMA ID → name tables.
- [ ] Flag any structures with known geometry issues (e.g. `FMA7163` skin — documented non-manifold triangles/holes) for extra QA or a fallback primitive.

### 2.2 — Conversion pipeline (pure Python, no Blender/gltf-transform)
Build a scripted, repeatable pipeline — this becomes a reusable internal tool, not a one-off:

```python
import trimesh

def convert_part(stl_path, out_path, group_origin=None):
    mesh = trimesh.load(stl_path)
    mesh.apply_translation(-(group_origin or mesh.bounding_box.centroid))
    # optional: mesh.fill_holes(), mesh.remove_duplicate_faces(), etc.
    #           for known-bad meshes like the skin surface
    trimesh.Scene(mesh).export(out_path)
```

- [ ] Batch-convert selected FMA `.stl` files to `.glb`, grouped into `skeleton.glb` / `muscles.glb` / `organs.glb` scenes (mirroring the POC's layer structure so the viewer code barely changes).
- [ ] Normalize all parts to a shared coordinate frame/scale (compute one bounding box across the full assembled body, not per-part, so parts don't drift when reassembled).
- [ ] Repair known-bad meshes (skin) using `trimesh.repair` utilities; accept that some manual QA/visual spot-checking is unavoidable here.
- [ ] Rebuild the mesh-name → part-ID mapping (equivalent of `skeletonMap.ts`/`muscleMap.ts`) against your new FMA-derived mesh names.

### 2.3 — Compression (optional, evaluate need first)
- [ ] Measure uncompressed `.glb` sizes after conversion. STL→glTF via trimesh is already reasonably compact; Draco may not be necessary for your target structure count.
- [ ] If needed: evaluate `DracoPy` for buffer compression, budgeting extra time — wiring compressed buffers back into valid glTF bufferViews is the fiddliest part of this whole plan and may need a dedicated spike.
- [ ] Alternative: consider mesh decimation (`trimesh`'s `simplify_quadric_decimation`) as a cheaper win before reaching for Draco at all.

### 2.4 — Swap-in
- [ ] Point the Phase 1 viewer at the new `.glb` outputs; mapping tables should make this close to a drop-in replacement.
- [ ] Re-verify click/highlight/isolate behavior against the new mesh names.
- [ ] Update `THIRD_PARTY_NOTICES.md` to reflect the actual source now in use.

**Exit criteria:** viewer runs on BodyParts3D-derived, normalized, provenance-clean geometry; POC interaction model unchanged; file sizes acceptable for target platform.

---

## Phase 3 — Production Hardening (3–5 weeks, parallelizable)

- [ ] **Automate the pipeline** (Phase 2.2–2.3) as a repeatable script/CI job, not a manual one-off — so new structures or model updates don't require re-doing this by hand.
- [ ] **QA pass** on every converted mesh: visual review, normal-direction checks, watertightness for anything beyond pure display (skip this if display-only).
- [ ] **Performance**: LOD strategy if targeting mobile/low-end devices; measure draw calls and frame time with full layer set active.
- [ ] **Accessibility**: keyboard navigation for part selection, screen-reader labels for anatomical terms, color-contrast for highlight states.
- [ ] **Legal/compliance final check**: attribution visible in shipped product, license texts bundled, citation of the original BodyParts3D paper included in docs/about page per the repo's citation request.
- [ ] **Testing**: unit tests for the mapping/lookup logic, visual regression tests for the 3D scene if feasible, cross-browser WebGL/Draco decoder checks.
- [ ] **Documentation**: internal runbook for how to add/regenerate a new anatomical structure through the pipeline (so this isn't tribal knowledge).

**Exit criteria:** production-ready build, automated asset pipeline, compliance checklist signed off.

---

## Phase 4 — Final Product / Scale-Out (ongoing)

- [ ] Expand structure coverage beyond POC scope as product needs grow (pipeline from Phase 2 makes this incremental, not a re-architecture).
- [ ] Consider contributing fixes upstream (e.g. skin mesh repair) back to `Kevin-Mattheus-Moerman/BodyParts3D` — it accepts PRs and explicitly calls out this exact need.
- [ ] Monitor for a v4.0-equivalent or successor dataset (e.g. the Leiden/AnatomyTOOL Open3DModel project) if broader/more modern anatomical coverage becomes a requirement — re-run Phase 0's license review if so.
- [ ] Periodic re-audit of third-party notices as assets/sources change.

---

## Risk Register (carry through all phases)

| Risk | Phase introduced | Mitigation |
|---|---|---|
| Viewer repo (0 stars) has unverified geometry/license accuracy | 1 | POC-only use; migrate before external release |
| Skin mesh (FMA7163) known non-manifold | 2 | Repair pass or primitive fallback |
| Draco re-integration complexity | 2.3 | Treat as optional spike; decimation as cheaper alternative |
| Manual pipeline steps become tribal knowledge | 2–3 | Automate as CI job in Phase 3 |
| Attribution/license text omitted at ship | 3 | Explicit checklist item, not implicit |