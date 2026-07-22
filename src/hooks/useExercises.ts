import { useEffect, useState } from 'react';
import { repository } from '@/data';
import type { Exercise } from '@/types';

/**
 * Loads exercises from the data repository. When `structureId` is provided, only
 * exercises that target that structure are returned.
 */
export function useExercises(structureId?: string): Exercise[] {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    let active = true;
    repository.getExercises(structureId).then((data) => {
      if (active) setExercises(data);
    });
    return () => {
      active = false;
    };
  }, [structureId]);

  return exercises;
}
