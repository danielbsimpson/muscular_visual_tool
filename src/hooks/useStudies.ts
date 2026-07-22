import { useEffect, useState } from 'react';
import { repository } from '@/data';
import type { Study } from '@/types';

/** Loads the studies referenced by the given ids, preserving repository order. */
export function useStudies(ids: string[]): Study[] {
  const [studies, setStudies] = useState<Study[]>([]);
  const key = ids.join(',');

  useEffect(() => {
    let active = true;
    if (ids.length === 0) {
      setStudies([]);
      return;
    }
    repository.getStudies(ids).then((data) => {
      if (active) setStudies(data);
    });
    return () => {
      active = false;
    };
    // `key` captures the id list; ids is intentionally omitted to avoid re-runs on new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return studies;
}
