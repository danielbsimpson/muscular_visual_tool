import type { Structure, Exercise, Study, SystemId } from '@/types';
import type { DataRepository } from './repository';
import structuresData from './datasets/structures.json';
import exercisesData from './datasets/exercises.json';
import studiesData from './datasets/studies.json';

/**
 * Reads anatomy, exercise, and study data from bundled static JSON datasets.
 * All lookups are in-memory; suitable for the fully client-side MVP.
 */
export class StaticJsonRepository implements DataRepository {
  private readonly structures: Structure[];
  private readonly exercises: Exercise[];
  private readonly studies: Study[];

  constructor(
    data: {
      structures?: Structure[];
      exercises?: Exercise[];
      studies?: Study[];
    } = {},
  ) {
    this.structures = data.structures ?? (structuresData as Structure[]);
    this.exercises = data.exercises ?? (exercisesData as Exercise[]);
    this.studies = data.studies ?? (studiesData as Study[]);
  }

  async getStructures(system?: SystemId): Promise<Structure[]> {
    if (!system) return this.structures;
    return this.structures.filter((s) => s.system === system);
  }

  async getStructure(id: string): Promise<Structure | undefined> {
    return this.structures.find((s) => s.id === id);
  }

  async getExercises(structureId?: string): Promise<Exercise[]> {
    if (!structureId) return this.exercises;
    return this.exercises.filter((e) => e.targets.some((t) => t.structureId === structureId));
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.find((e) => e.id === id);
  }

  async getStudies(ids: string[]): Promise<Study[]> {
    const wanted = new Set(ids);
    return this.studies.filter((s) => wanted.has(s.id));
  }
}
