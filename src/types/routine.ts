/** Exercises assigned to a single day of the week (day 0 = Monday). */
export interface RoutineDay {
  day: number;
  exerciseIds: string[];
}

/** A named weekly training routine. */
export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
  /** Epoch milliseconds of the last update. */
  updatedAt: number;
}
