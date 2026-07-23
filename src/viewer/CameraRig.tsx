import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useViewerStore } from '@/state/store';
import { getPartCenter } from './bodyParts';
import { getStructureBounds } from './modelBounds';
import { useAnatomyModel } from './useAnatomyModel';

interface OrbitLike {
  target: Vector3;
  update: () => void;
}

/** Where the camera should look and, for loaded geometry, how far to sit. */
interface Focus {
  center: Vector3;
  /** Bounding radius (0 when derived from the procedural mannequin). */
  radius: number;
}

const LERP_STEP = 0.12;
const FOV_DEG = 45;
const FIT_MARGIN = 1.5;
const MIN_DISTANCE = 0.6;
const MAX_DISTANCE = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Smoothly pans the camera and orbit target to centre the selected structure.
 * When the anatomical model is loaded it frames real geometry bounds and clamps
 * the distance so the structure fits the view; otherwise it preserves the prior
 * behaviour of panning to the procedural part centre at the current distance.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;
  const selectedId = useViewerStore((s) => s.selectedId);
  const { index, ready } = useAnatomyModel();

  const desired = useMemo<Focus | null>(() => {
    if (!selectedId) return null;
    if (ready) {
      const bounds = getStructureBounds(index, selectedId);
      if (bounds) return { center: bounds.center, radius: bounds.radius };
    }
    const center = getPartCenter(selectedId);
    return center ? { center: new Vector3(center[0], center[1], center[2]), radius: 0 } : null;
  }, [selectedId, ready, index]);

  useFrame(() => {
    if (!desired || !controls) return;
    const targetDelta = desired.center.clone().sub(controls.target);

    // Loaded geometry: also lerp the camera to a fitting distance.
    if (desired.radius > 0) {
      const direction = camera.position.clone().sub(controls.target).normalize();
      const fov = (FOV_DEG * Math.PI) / 180;
      const fitDistance = clamp(
        (desired.radius * FIT_MARGIN) / Math.sin(fov / 2),
        MIN_DISTANCE,
        MAX_DISTANCE,
      );
      const cameraDelta = desired.center
        .clone()
        .add(direction.multiplyScalar(fitDistance))
        .sub(camera.position);
      if (targetDelta.lengthSq() < 1e-5 && cameraDelta.lengthSq() < 1e-5) return;
      controls.target.add(targetDelta.multiplyScalar(LERP_STEP));
      camera.position.add(cameraDelta.multiplyScalar(LERP_STEP));
      controls.update();
      return;
    }

    // Procedural fallback: pan target and camera together, preserving distance.
    if (targetDelta.lengthSq() < 1e-5) return;
    const step = targetDelta.multiplyScalar(LERP_STEP);
    controls.target.add(step);
    camera.position.add(step);
    controls.update();
  });

  return null;
}
