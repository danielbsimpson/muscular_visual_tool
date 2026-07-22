import type { Structure, Exercise, Study, SystemId } from '@/types';

/**
 * Abstraction over the data source. M1 ships a `StaticJsonRepository`; a future
 * `ApiRepository` can implement the same contract without touching UI code.
 */
export interface DataRepository {
  getStructures(system?: SystemId): Promise<Structure[]>;
  getStructure(id: string): Promise<Structure | undefined>;
  getExercises(structureId?: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  getStudies(ids: string[]): Promise<Study[]>;
}
