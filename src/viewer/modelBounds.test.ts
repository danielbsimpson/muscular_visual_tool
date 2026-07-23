import { describe, it, expect } from 'vitest';
import { BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
import { getStructureBounds } from './modelBounds';
import type { StructureIndex } from './tagStructures';

function buildIndex(): StructureIndex {
  const mesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial());
  mesh.position.set(2, 3, -1);
  mesh.updateMatrixWorld(true);
  const index: StructureIndex = new Map();
  index.set('heart', [mesh]);
  return index;
}

describe('getStructureBounds', () => {
  it('returns the center and a positive radius for a known structure', () => {
    const bounds = getStructureBounds(buildIndex(), 'heart');
    expect(bounds).not.toBeNull();
    expect(bounds?.center.x).toBeCloseTo(2);
    expect(bounds?.center.y).toBeCloseTo(3);
    expect(bounds?.center.z).toBeCloseTo(-1);
    expect(bounds?.radius).toBeGreaterThan(0);
  });

  it('returns null for an unknown structure id', () => {
    expect(getStructureBounds(buildIndex(), 'does-not-exist')).toBeNull();
  });
});
