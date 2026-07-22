import { useMemo } from 'react';
import type { Structure, SystemId } from '@/types';

const SYSTEM_LABELS: Record<SystemId, string> = {
  muscular: 'Muscles',
  skeletal: 'Bones',
  respiratory: 'Respiratory',
  cardiovascular: 'Cardiovascular',
};

interface StructureListProps {
  structures: Structure[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StructureList({ structures, selectedId, onSelect }: StructureListProps) {
  const grouped = useMemo(() => {
    const map = new Map<SystemId, Structure[]>();
    for (const s of structures) {
      const arr = map.get(s.system) ?? [];
      arr.push(s);
      map.set(s.system, arr);
    }
    return [...map.entries()];
  }, [structures]);

  return (
    <nav className="structure-list" aria-label="Structures">
      {grouped.map(([system, items]) => (
        <div key={system} className="structure-group">
          <h3 className="structure-group-title">{SYSTEM_LABELS[system]}</h3>
          <ul>
            {items.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={s.id === selectedId ? 'active' : ''}
                  aria-current={s.id === selectedId ? 'true' : undefined}
                  onClick={() => onSelect(s.id)}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
