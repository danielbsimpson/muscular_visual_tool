import { Box3, Sphere, Vector3, type Object3D } from 'three';
import type { StructureIndex } from './tagStructures';

/** A structure's world-space focus point and enclosing radius. */
export interface StructureBounds {
  center: Vector3;
  radius: number;
}

/**
 * Compute the union bounding box of every object that makes up a structure and
 * return its center and bounding-sphere radius. Used to drive camera fly-to and
 * distance-to-fit from real geometry (TASK-018/019). Returns `null` when the id
 * is unknown or contributes no geometry.
 */
export function getStructureBounds(
  index: StructureIndex,
  structureId: string,
): StructureBounds | null {
  const objects = index.get(structureId);
  if (!objects || objects.length === 0) return null;

  const box = new Box3();
  let hasGeometry = false;
  for (const object of objects) {
    const objectBox = new Box3().setFromObject(object as Object3D);
    if (objectBox.isEmpty()) continue;
    box.union(objectBox);
    hasGeometry = true;
  }

  if (!hasGeometry) return null;

  const sphere = new Sphere();
  box.getBoundingSphere(sphere);
  return { center: sphere.center.clone(), radius: sphere.radius };
}
