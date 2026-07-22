import { lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Structure } from '@/types';
import { useStructures } from '@/hooks/useStructures';
import { useExercises } from '@/hooks/useExercises';
import { useStudies } from '@/hooks/useStudies';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { useViewerStore } from '@/state/store';
import { LayerControls } from '@/viewer';
import { SearchBar, StructureList, InfoPanel } from '@/components';

// Code-split the 3D scene (and Three.js) so it only loads when the viewer is shown.
const Scene = lazy(() => import('@/viewer/Scene').then((m) => ({ default: m.Scene })));

export function ExploreView() {
  const navigate = useNavigate();
  const structures = useStructures();
  const webglSupported = useWebGLSupport();
  const selectedId = useViewerStore((s) => s.selectedId);
  const select = useViewerStore((s) => s.select);

  const selected = useMemo(
    () => structures.find((s) => s.id === selectedId) ?? null,
    [structures, selectedId],
  );

  const related = useMemo<Structure[]>(() => {
    if (!selected?.relatedStructureIds) return [];
    return selected.relatedStructureIds
      .map((id) => structures.find((s) => s.id === id))
      .filter((s): s is Structure => Boolean(s));
  }, [selected, structures]);

  const exercises = useExercises(selectedId ?? undefined);

  const studyIds = useMemo(() => {
    const ids = new Set<string>();
    for (const e of exercises) for (const id of e.studyIds) ids.add(id);
    return [...ids];
  }, [exercises]);

  const studies = useStudies(studyIds);

  return (
    <div className="explore">
      <aside className="explore-sidebar">
        <h1 className="explore-title">Explore</h1>
        <SearchBar structures={structures} onSelect={select} />
        <LayerControls />
        <StructureList structures={structures} selectedId={selectedId} onSelect={select} />
      </aside>

      <div className="explore-stage">
        {webglSupported ? (
          <Suspense
            fallback={
              <div className="explore-fallback">
                <p>Loading 3D view…</p>
              </div>
            }
          >
            <Scene />
          </Suspense>
        ) : (
          <div className="explore-fallback">
            <p>
              The 3D view isn&apos;t available in this environment. Browse structures from the list
              on the left to read about them.
            </p>
          </div>
        )}
      </div>

      <aside className="explore-info">
        <InfoPanel
          structure={selected}
          related={related}
          exercises={exercises}
          studies={studies}
          onSelect={select}
          onSelectExercise={(id) => navigate(`/exercises/${id}`)}
        />
      </aside>
    </div>
  );
}
