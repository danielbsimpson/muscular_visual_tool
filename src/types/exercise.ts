import type { FocusTag } from './system';

/** Links an exercise to a structure it trains and how directly. */
export interface ExerciseTarget {
  structureId: string;
  role: 'primary' | 'secondary';
}

/** A variation of an exercise (easier, harder, or an alternate form). */
export interface ExerciseVariation {
  id: string;
  name: string;
  note: string;
  difficulty: 'easier' | 'harder' | 'alternate';
}

/** An exercise with technique guidance and the structures it targets. */
export interface Exercise {
  id: string;
  name: string;
  focus: FocusTag[];
  targets: ExerciseTarget[];
  /** Technique cues. */
  cues: string[];
  commonMistakes: string[];
  variations: ExerciseVariation[];
  studyIds: string[];
}
