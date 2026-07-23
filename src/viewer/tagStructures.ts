import type { Group, Object3D } from 'three';
import type { SystemId } from '@/types';

/** Index from a `Structure.id` to the scene objects that represent it. */
export type StructureIndex = Map<string, Object3D[]>;

/**
 * Walk a loaded GLB scene and tag every node whose name appears in `meshMap`
 * with its `structureId` and owning `system`. Populates and returns a structure
 * index (`structureId → Object3D[]`) for O(1) selection/highlight lookup.
 *
 * Tagging is data-driven: no per-mesh conditionals live in components (GUD-001).
 *
 * @param scene   Root group of a parsed GLB.
 * @param meshMap Node-name → `structureId` lookup (`meshMap.json`).
 * @param system  The body system this scene belongs to.
 * @param index   Optional existing index to accumulate into (across systems).
 */
export function tagScene(
  scene: Group,
  meshMap: Record<string, string>,
  system: SystemId,
  index: StructureIndex = new Map(),
): StructureIndex {
  scene.traverse((object) => {
    const structureId = meshMap[object.name];
    if (!structureId) return;

    object.userData.structureId = structureId;
    object.userData.system = system;

    const existing = index.get(structureId);
    if (existing) {
      existing.push(object);
    } else {
      index.set(structureId, [object]);
    }
  });

  return index;
}
