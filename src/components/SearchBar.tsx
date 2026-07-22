import { useMemo, useState } from 'react';
import type { Structure } from '@/types';

interface SearchBarProps {
  structures: Structure[];
  onSelect: (id: string) => void;
}

export function SearchBar({ structures, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return structures
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.anatomicalName?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8);
  }, [query, structures]);

  return (
    <div className="search-bar">
      <label className="sr-only" htmlFor="structure-search">
        Search structures
      </label>
      <input
        id="structure-search"
        type="search"
        placeholder="Search muscles & bones…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {matches.length > 0 && (
        <ul className="search-results">
          {matches.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(m.id);
                  setQuery('');
                }}
              >
                <span>{m.name}</span>
                <small>{m.system}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
