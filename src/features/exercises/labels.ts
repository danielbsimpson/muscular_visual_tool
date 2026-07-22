import type { FocusTag } from '@/types';

/** Human-readable labels for each training focus tag. */
export const FOCUS_LABELS: Record<FocusTag, string> = {
  hypertrophy: 'Hypertrophy',
  strength: 'Strength',
  boneDensity: 'Bone density',
  vo2max: 'VO\u2082 max',
  breathWork: 'Breath work',
  mobility: 'Mobility',
  endurance: 'Endurance',
};

/** Focus tags in the order they should appear in filters. */
export const FOCUS_ORDER: FocusTag[] = [
  'strength',
  'hypertrophy',
  'endurance',
  'vo2max',
  'boneDensity',
  'breathWork',
  'mobility',
];
