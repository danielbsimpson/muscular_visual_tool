import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useViewerStore } from '@/state/store';
import { getPartCenter } from './bodyParts';

interface OrbitLike {
  target: Vector3;
  update: () => void;
}

/**
 * Smoothly pans the camera and orbit target to centre the selected structure,
 * preserving the current viewing angle and distance.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const selectedId = useViewerStore((s) => s.selectedId);

  const desired = useMemo<Vector3 | null>(() => {
    const center = selectedId ? getPartCenter(selectedId) : null;
    return center ? new Vector3(center[0], center[1], center[2]) : null;
  }, [selectedId]);

  useFrame(() => {
    if (!desired || !controls) return;
    const delta = desired.clone().sub(controls.target);
    if (delta.lengthSq() < 1e-5) return;
    const step = delta.multiplyScalar(0.12);
    controls.target.add(step);
    camera.position.add(step);
    controls.update();
  });

  return null;
}
