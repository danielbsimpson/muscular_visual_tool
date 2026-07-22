import { useMemo } from 'react';
import type { Exercise, Structure, Study } from '@/types';
import { StudyCard } from '@/components';
import { FOCUS_LABELS } from './labels';

interface ExerciseDetailProps {
  exercise: Exercise | null;
  structures: Structure[];
  studies: Study[];
  onSelectStructure: (id: string) => void;
}

export function ExerciseDetail({
  exercise,
  structures,
  studies,
  onSelectStructure,
}: ExerciseDetailProps) {
  const byId = useMemo(() => {
    const map = new Map<string, Structure>();
    for (const s of structures) map.set(s.id, s);
    return map;
  }, [structures]);

  if (!exercise) {
    return (
      <div className="exercise-detail exercise-detail--empty">
        <p>Select an exercise to see how to perform it, what it trains, and the evidence behind it.</p>
      </div>
    );
  }

  const primary = exercise.targets.filter((t) => t.role === 'primary');
  const secondary = exercise.targets.filter((t) => t.role === 'secondary');

  const renderTargets = (targets: typeof exercise.targets) =>
    targets.map((t) => {
      const structure = byId.get(t.structureId);
      const label = structure?.name ?? t.structureId;
      return (
        <li key={t.structureId}>
          {structure ? (
            <button type="button" className="target-chip" onClick={() => onSelectStructure(t.structureId)}>
              {label}
            </button>
          ) : (
            <span className="target-chip target-chip--static">{label}</span>
          )}
        </li>
      );
    });

  return (
    <div className="exercise-detail">
      <h2>{exercise.name}</h2>
      <div className="focus-tags">
        {exercise.focus.map((tag) => (
          <span key={tag} className="focus-tag" data-focus={tag}>
            {FOCUS_LABELS[tag]}
          </span>
        ))}
      </div>

      <h3>Primary targets</h3>
      <ul className="target-list">{renderTargets(primary)}</ul>

      {secondary.length > 0 && (
        <>
          <h3>Secondary targets</h3>
          <ul className="target-list">{renderTargets(secondary)}</ul>
        </>
      )}

      <h3>Technique cues</h3>
      <ol className="cue-list">
        {exercise.cues.map((cue) => (
          <li key={cue}>{cue}</li>
        ))}
      </ol>

      <h3>Common mistakes</h3>
      <ul className="mistake-list">
        {exercise.commonMistakes.map((mistake) => (
          <li key={mistake}>{mistake}</li>
        ))}
      </ul>

      {exercise.variations.length > 0 && (
        <>
          <h3>Variations</h3>
          <ul className="variation-list">
            {exercise.variations.map((v) => (
              <li key={v.id}>
                <span className="variation-name">{v.name}</span>
                <span className="variation-difficulty" data-difficulty={v.difficulty}>
                  {v.difficulty}
                </span>
                <span className="variation-note">{v.note}</span>
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