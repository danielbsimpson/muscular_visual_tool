import { describe, it, expect } from 'vitest';
import meshMap from '@/data/datasets/meshMap.json';
import structures from '@/data/datasets/structures.json';

describe('meshMap.json', () => {
  const structureIds = new Set(structures.map((s) => s.id));

  it('maps every node name to a structure id present in structures.json', () => {
    for (const [nodeName, structureId] of Object.entries(meshMap)) {
      expect(structureIds.has(structureId), `${nodeName} → ${structureId}`).toBe(true);
    }
  });

  it('provides at least one node mapping for every structure that declares meshIds', () => {
    const mappedStructureIds = new Set(Object.values(meshMap));
    for (const structure of structures) {
      if (structure.meshIds.length > 0) {
        expect(mappedStructureIds.has(structure.id), structure.id).toBe(true);
      }
    }
  });
});
