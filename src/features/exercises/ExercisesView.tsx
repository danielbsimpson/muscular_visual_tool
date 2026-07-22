import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FocusTag } from '@/types';
import { useExercises } from '@/hooks/useExercises';
import { useStructures } from '@/hooks/useStructures';
import { useStudies } from '@/hooks/useStudies';
import { useViewerStore } from '@/state/store';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseDetail } from './ExerciseDetail';
import { FOCUS_LABELS, FOCUS_ORDER } from './labels';

export function ExercisesView() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const exercises = useExercises();
  const structures = useStructures();
  const select = useViewerStore((s) => s.select);

  const [focusFilter, setFocusFilter] = useState<FocusTag | 'all'>('all');
  const [structureFilter, setStructureFilter] = useState<string>('all');

  const availableFocus = useMemo(() => {
    const present = new Set<FocusTag>();
    for (const e of exercises) for (const f of e.focus) present.add(f);
    return FOCUS_ORDER.filter((f) => present.has(f));
  }, [exercises]);

  const filtered = useMemo(
    () =>
      exercises.filter((e) => {
        const focusOk = focusFilter === 'all' || e.focus.includes(focusFilter);
        const structureOk =
          structureFilter === 'all' || e.targets.some((t) => t.structureId === structureFilter);
        return focusOk && structureOk;
      }),
    [exercises, focusFilter, structureFilter],
  );

  const selected = useMemo(
    () => exercises.find((e) => e.id === exerciseId) ?? null,
    [exercises, exerciseId],
  );

  const studies = useStudies(selected?.studyIds ?? []);

  const openExercise = (id: string) => navigate(`/exercises/${id}`);

  const goToStructure = (id: string) => {
    select(id);
    navigate('/');
  };

  return (
    <div className="exercises">
      <aside className="exercises-sidebar">
        <h1 className="explore-title">Exercises</h1>

        <div className="filters">
          <label className="filter">
            <span>Focus</span>
            <select
              value={focusFilter}
              onChange={(e) => setFocusFilter(e.target.value as FocusTag | 'all')}
            >
              <option value="all">All focuses</option>
              {availableFocus.map((f) => (
                <option key={f} value={f}>
                  {FOCUS_LABELS[f]}
                </option>
              ))}
            </select>
          </label>

          <label className="filter">
            <span>Targets</span>
            <select value={structureFilter} onChange={(e) => setStructureFilter(e.target.value)}>
              <option value="all">All structures</option>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="result-count">
          {filtered.length} exercise{filtered.length === 1 ? '' : 's'}
        </p>

        <nav aria-label="Exercises">
          <ul className="exercise-list">
            {filtered.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                active={exercise.id === exerciseId}
                onSelect={openExercise}
              />
            ))}
          </ul>
          {filtered.length === 0 && <p className="result-count">No exercises match those filters.</p>}
        </nav>
      </aside>

      <section className="exercises-detail">
        <ExerciseDetail
          exercise={selected}
          structures={structures}
          studies={studies}
          onSelectStructure={goToStructure}
        />
      </section>
    </div>
  );
}
