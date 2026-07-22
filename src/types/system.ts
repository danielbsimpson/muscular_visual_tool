/** Identifiers for the major body systems ExoView visualizes. */
export type SystemId = 'muscular' | 'skeletal' | 'respiratory' | 'cardiovascular';

/** Training focus categories an exercise can develop. */
export type FocusTag =
  | 'hypertrophy'
  | 'strength'
  | 'boneDensity'
  | 'vo2max'
  | 'breathWork'
  | 'mobility'
  | 'endurance';

/** Display metadata for a body system. */
export interface SystemInfo {
  id: SystemId;
  name: string;
  description: string;
}
