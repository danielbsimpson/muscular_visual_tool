import { describe, it, expect } from 'vitest';
import { bodyParts, getPartCenter } from './bodyParts';
import structures from '@/data/datasets/structures.json';

describe('bodyParts', () => {
  const ids = new Set(structures.map((s) => s.id));

  it('maps every modeled part to a known structure', () => {
    for (const part of bodyParts) {
      expect(ids.has(part.structureId)).toBe(true);
    }
  });

  it('gives every part at least one mesh', () => {
    for (const part of bodyParts) {
      expect(part.meshes.length).toBeGreaterThan(0);
    }
  });

  it('returns a focus point for a known structure', () => {
    expect(getPartCenter('skull')).not.toBeNull();
  });

  it('returns null for an unknown structure', () => {
    expect(getPartCenter('does-not-exist')).toBeNull();
  });
});
