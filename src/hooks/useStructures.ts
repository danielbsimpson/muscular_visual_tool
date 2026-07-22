import { useEffect, useState } from 'react';
import { repository } from '@/data';
import type { Structure, SystemId } from '@/types';

/** Loads all structures from the data repository once on mount. */
export function useStructures(system?: SystemId): Structure[] {
  const [structures, setStructures] = useState<Structure[]>([]);

  useEffect(() => {
    let active = true;
    repository.getStructures(system).then((data) => {
      if (active) setStructures(data);
    });
    return () => {
      active = false;
    };
  }, [system]);

  return structures;
}
