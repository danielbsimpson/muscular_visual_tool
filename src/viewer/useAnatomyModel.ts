import { useEffect, useState } from 'react';
import type { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { SystemId } from '@/types';
import meshMap from '@/data/datasets/meshMap.json';
import { DRACO_DECODER_PATH, MODELED_SYSTEMS, MODEL_URLS, MODELS_ENABLED } from './modelManifest';
import { tagScene, type StructureIndex } from './tagStructures';

/** Parsed, tagged per-system anatomy scenes plus a structure lookup index. */
export interface AnatomyModel {
  /** One tagged scene per loaded system (absent systems are omitted). */
  scenes: Partial<Record<SystemId, Group>>;
  /** `structureId → Object3D[]` across all loaded systems (PAT-001). */
  index: StructureIndex;
  /** True once every system GLB has loaded and been tagged. */
  ready: boolean;
  /** Set when loading failed; the viewer then uses the procedural fallback. */
  error: Error | null;
}

const EMPTY: AnatomyModel = { scenes: {}, index: new Map(), ready: false, error: null };

// Module-level cache so multiple consumers (BodyModel, CameraRig) share one load.
let cached: AnatomyModel | null = null;
let loadPromise: Promise<AnatomyModel> | null = null;

function createLoader(): GLTFLoader {
  const draco = new DRACOLoader();
  // Self-hosted decoder — no third-party origin fetched at runtime (SEC-002).
  draco.setDecoderPath(DRACO_DECODER_PATH);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

function loadAll(): Promise<AnatomyModel> {
  if (loadPromise) return loadPromise;

  const loader = createLoader();
  loadPromise = Promise.all(
    MODELED_SYSTEMS.map((system) =>
      loader.loadAsync(MODEL_URLS[system]).then((gltf) => [system, gltf.scene] as const),
    ),
  ).then((entries) => {
    const scenes: Partial<Record<SystemId, Group>> = {};
    const index: StructureIndex = new Map();
    for (const [system, scene] of entries) {
      scenes[system] = scene;
      tagScene(scene, meshMap as Record<string, string>, system, index);
    }
    const model: AnatomyModel = { scenes, index, ready: true, error: null };
    cached = model;
    return model;
  });

  return loadPromise;
}

/** Kick off decoding as soon as the (lazy) Scene chunk loads (TASK-011). */
export function preloadAnatomyModel(): void {
  if (!MODELS_ENABLED || cached) return;
  void loadAll().catch(() => {
    /* handled per-hook via the error state */
  });
}

/**
 * Loads the per-system anatomical GLBs once, memoizes the parsed scenes, and
 * returns them alongside a structure index. When assets are disabled or fail to
 * load, returns `ready: false` so callers fall back to the procedural mannequin
 * (GUD-002 — a single warning is logged on failure).
 */
export function useAnatomyModel(): AnatomyModel {
  const [state, setState] = useState<AnatomyModel>(() => cached ?? EMPTY);

  useEffect(() => {
    if (!MODELS_ENABLED || cached) return;

    let cancelled = false;
    loadAll()
      .then((model) => {
        if (!cancelled) setState(model);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        console.warn(
          '[ExoView] Anatomy model failed to load; using procedural fallback.',
          error,
        );
        setState({ scenes: {}, index: new Map(), ready: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
