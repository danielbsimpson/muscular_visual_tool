import type { Structure, SystemId, Exercise, Study } from '@/types';
import { StudyCard } from './StudyCard';

const SYSTEM_LABELS: Record<SystemId, string> = {
  muscular: 'Muscle',
  skeletal: 'Bone',
  respiratory: 'Respiratory',
  cardiovascular: 'Cardiovascular',
};

interface InfoPanelProps {
  structure: Structure | null;
  related: Structure[];
  exercises: Exercise[];
  studies: Study[];
  onSelect: (id: string) => void;
  onSelectExercise: (id: string) => void;
}

export function InfoPanel({
  structure,
  related,
  exercises,
  studies,
  onSelect,
  onSelectExercise,
}: InfoPanelProps) {
  if (!structure) {
    return (
      <div className="info-panel info-panel--empty">
        <p>Select a structure to see its name, description, and function.</p>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <span className="system-badge" data-system={structure.system}>
        {SYSTEM_LABELS[structure.system]}
      </span>
      <h2>{structure.name}</h2>
      {structure.anatomicalName && <p className="anatomical-name">{structure.anatomicalName}</p>}

      <h3>Description</h3>
      <p>{structure.description}</p>

      <h3>Function</h3>
      <p>{structure.function}</p>

      {related.length > 0 && (
        <>
          <h3>Related structures</h3>
          <ul className="related-list">
            {related.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => onSelect(r.id)}>
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {exercises.length > 0 && (
        <>
          <h3>Exercises that train this</h3>
          <ul className="related-list">
            {exercises.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => onSelectExercise(e.id)}>
                  {e.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {studies.length > 0 && (
        <>
          <h3>Evidence</h3>
          <div className="study-list">
            {studies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
