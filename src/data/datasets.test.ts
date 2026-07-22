import { describe, it, expect } from 'vitest';
import structures from './datasets/structures.json';
import exercises from './datasets/exercises.json';
import studies from './datasets/studies.json';

const structureIds = new Set(structures.map((s) => s.id));
const studyIds = new Set(studies.map((s) => s.id));

describe('datasets integrity', () => {
  it('covers all four body systems in structures', () => {
    const systems = new Set(structures.map((s) => s.system));
    expect(systems).toEqual(new Set(['muscular', 'skeletal', 'respiratory', 'cardiovascular']));
  });

  it('references only existing structures from related links', () => {
    for (const s of structures) {
      for (const id of s.relatedStructureIds ?? []) {
        expect(structureIds.has(id)).toBe(true);
      }
    }
  });

  it('links every exercise target to an existing structure', () => {
    for (const e of exercises) {
      expect(e.targets.length).toBeGreaterThan(0);
      for (const t of e.targets) {
        expect(structureIds.has(t.structureId)).toBe(true);
      }
    }
  });

  it('gives every exercise at least one primary target', () => {
    for (const e of exercises) {
      expect(e.targets.some((t) => t.role === 'primary')).toBe(true);
    }
  });

  it('backs every exercise with at least one existing study', () => {
    for (const e of exercises) {
      expect(e.studyIds.length).toBeGreaterThan(0);
      for (const id of e.studyIds) {
        expect(studyIds.has(id)).toBe(true);
      }
    }
  });

  it('has a unique id for every study', () => {
    expect(studyIds.size).toBe(studies.length);
  });
});
