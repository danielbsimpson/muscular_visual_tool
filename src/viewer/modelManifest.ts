import type { SystemId } from '@/types';

/**
 * Runtime manifest for the per-system anatomical GLB assets.
 *
 * Assets are served from the app origin under `public/models/` (SEC-002) and
 * fetched at runtime — never statically imported into the JS bundle (REQ-006).
 * The self-hosted Draco decoder lives under `public/decoders/draco/`.
 *
 * The GLB files are produced offline by the asset pipeline documented in
 * `docs/MODEL_MAPPING.md`. Until they are present, `MODELS_ENABLED` stays
 * `false` and the viewer renders the procedural mannequin fallback (GUD-002).
 */

/** Systems that have (or will have) a dedicated GLB, in display order. */
export const MODELED_SYSTEMS: SystemId[] = [
  'muscular',
  'skeletal',
  'respiratory',
  'cardiovascular',
];

/** Public URL of each per-system GLB asset. */
export const MODEL_URLS: Record<SystemId, string> = {
  muscular: '/models/muscular.glb',
  skeletal: '/models/skeletal.glb',
  respiratory: '/models/respiratory.glb',
  cardiovascular: '/models/cardiovascular.glb',
};

/** Public path of the self-hosted Draco decoder (SEC-002 — no CDN fetch). */
export const DRACO_DECODER_PATH = '/decoders/draco/';

/**
 * Whether real anatomical GLB assets are available to load.
 *
 * Set to `true` once the license-cleared, compressed GLBs from the asset
 * pipeline have been placed under `public/models/`. While `false`, the viewer
 * skips network fetches entirely and uses the procedural mannequin, so the app
 * works offline and never logs 404s for missing assets.
 */
export const MODELS_ENABLED = false;
