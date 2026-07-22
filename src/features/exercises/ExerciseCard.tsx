import type { Exercise } from '@/types';
import { FOCUS_LABELS } from './labels';

interface ExerciseCardProps {
  exercise: Exercise;
  active: boolean;
  onSelect: (id: string) => void;
}

export function ExerciseCard({ exercise, active, onSelect }: ExerciseCardProps) {
  return (
    <li>
      <button
        type="button"
        className={active ? 'exercise-card active' : 'exercise-card'}
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(exercise.id)}
      >
        <span className="exercise-card-name">{exercise.name}</span>
        <span className="focus-tags">
          {exercise.focus.map((tag) => (
            <span key={tag} className="focus-tag" data-focus={tag}>
              {FOCUS_LABELS[tag]}
            </span>
          ))}
        </span>
      </button>
    </li>
  );
}