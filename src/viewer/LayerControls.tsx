import type { SystemId } from '@/types';
import { useViewerStore } from '@/state/store';
import { modeledSystems } from './bodyParts';

const LABELS: Record<SystemId, string> = {
  muscular: 'Muscles',
  skeletal: 'Bones',
  respiratory: 'Respiratory',
  cardiovascular: 'Cardiovascular',
};

export function LayerControls() {
  const visibleSystems = useViewerStore((s) => s.visibleSystems);
  const systemOpacity = useViewerStore((s) => s.systemOpacity);
  const toggleSystem = useViewerStore((s) => s.toggleSystem);
  const setOpacity = useViewerStore((s) => s.setOpacity);

  return (
    <div className="layer-controls">
      <h2 className="panel-heading">Layers</h2>
      {modeledSystems.map((system) => (
        <div key={system} className="layer-row">
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleSystems[system]}
              onChange={() => toggleSystem(system)}
            />
            {LABELS[system]}
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={systemOpacity[system]}
            onChange={(e) => setOpacity(system, Number(e.target.value))}
            aria-label={`${LABELS[system]} opacity`}
            disabled={!visibleSystems[system]}
          />
        </div>
      ))}
    </div>
  );
}
