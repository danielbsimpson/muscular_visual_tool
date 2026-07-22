import type { SystemId } from '@/types';
import type { BodyPart, MeshDef, MeshKind } from './viewer.types';

/**
 * A procedural "mannequin" approximation of the human body. Each anatomical
 * structure is represented by one or more primitive meshes positioned to roughly
 * match its location. Meshes carry a `structureId` so the viewer can drive
 * selection, highlighting, and layer toggles. A rigged anatomical model can later
 * replace these primitives by mapping its named meshes to the same structure ids
 * (see docs/MODEL_MAPPING.md).
 *
 * Coordinate system: metres, +Y up, subject facing +Z, centred on X.
 */

function mesh(
  id: string,
  kind: MeshKind,
  position: [number, number, number],
  args: number[],
  rotation?: [number, number, number],
): MeshDef {
  return rotation ? { id, kind, position, args, rotation } : { id, kind, position, args };
}

/** Build a central (non-mirrored) part. */
function central(structureId: string, system: SystemId, meshes: MeshDef[]): BodyPart {
  return { structureId, system, meshes };
}

/** Build a left/right symmetric part by mirroring a single mesh across X. */
function paired(
  structureId: string,
  system: SystemId,
  kind: MeshKind,
  position: [number, number, number],
  args: number[],
  rotation?: [number, number, number],
): BodyPart {
  const [x, y, z] = position;
  const left = mesh(`${structureId}-l`, kind, [-Math.abs(x), y, z], args, rotation);
  const right = mesh(`${structureId}-r`, kind, [Math.abs(x), y, z], args, rotation);
  return { structureId, system, meshes: [left, right] };
}

const HALF_PI = Math.PI / 2;

export const bodyParts: BodyPart[] = [
  // ---- Skeletal (inner layer) ----
  central('skull', 'skeletal', [mesh('skull', 'sphere', [0, 1.62, 0], [0.12, 20, 20])]),
  central('vertebral-column', 'skeletal', [
    mesh('vertebral-column', 'capsule', [0, 1.15, -0.07], [0.035, 0.58, 4, 10]),
  ]),
  central('rib-cage', 'skeletal', [mesh('rib-cage', 'box', [0, 1.3, 0], [0.26, 0.32, 0.18])]),
  paired('clavicle', 'skeletal', 'capsule', [0.1, 1.5, 0.06], [0.02, 0.18, 4, 8], [0, 0, HALF_PI]),
  paired('humerus', 'skeletal', 'capsule', [0.22, 1.28, 0], [0.03, 0.28, 4, 8]),
  paired('radius-ulna', 'skeletal', 'capsule', [0.24, 1.0, 0], [0.025, 0.26, 4, 8]),
  central('pelvis', 'skeletal', [mesh('pelvis', 'box', [0, 0.95, 0], [0.28, 0.16, 0.18])]),
  paired('femur', 'skeletal', 'capsule', [0.1, 0.68, 0], [0.035, 0.42, 4, 8]),
  paired('tibia-fibula', 'skeletal', 'capsule', [0.1, 0.28, 0], [0.03, 0.4, 4, 8]),

  // ---- Muscular (outer layer) ----
  central('trapezius', 'muscular', [mesh('trapezius', 'box', [0, 1.47, -0.03], [0.3, 0.1, 0.12])]),
  paired('deltoids', 'muscular', 'sphere', [0.22, 1.44, 0], [0.09, 16, 16]),
  paired('pectoralis-major', 'muscular', 'box', [0.09, 1.34, 0.09], [0.16, 0.14, 0.06]),
  paired('biceps-brachii', 'muscular', 'capsule', [0.235, 1.27, 0.04], [0.05, 0.2, 4, 10]),
  paired('triceps-brachii', 'muscular', 'capsule', [0.235, 1.27, -0.04], [0.05, 0.2, 4, 10]),
  paired('forearm-flexors', 'muscular', 'capsule', [0.255, 1.0, 0.02], [0.045, 0.22, 4, 10]),
  central('rectus-abdominis', 'muscular', [
    mesh('rectus-abdominis', 'box', [0, 1.1, 0.1], [0.18, 0.26, 0.06]),
  ]),
  paired('obliques', 'muscular', 'box', [0.13, 1.1, 0.06], [0.07, 0.22, 0.1]),
  paired('latissimus-dorsi', 'muscular', 'box', [0.12, 1.2, -0.06], [0.1, 0.24, 0.1]),
  paired('gluteus-maximus', 'muscular', 'box', [0.1, 0.93, -0.1], [0.14, 0.16, 0.1]),
  paired('quadriceps', 'muscular', 'capsule', [0.11, 0.7, 0.05], [0.075, 0.36, 4, 12]),
  paired('hamstrings', 'muscular', 'capsule', [0.11, 0.7, -0.05], [0.07, 0.34, 4, 12]),
  paired('gastrocnemius', 'muscular', 'capsule', [0.11, 0.32, -0.04], [0.06, 0.26, 4, 12]),

  // ---- Respiratory (within the rib cage) ----
  paired('lungs', 'respiratory', 'box', [0.07, 1.33, 0], [0.09, 0.22, 0.12]),
  central('diaphragm', 'respiratory', [
    mesh('diaphragm', 'box', [0, 1.18, 0], [0.22, 0.03, 0.16]),
  ]),
  central('trachea', 'respiratory', [
    mesh('trachea', 'capsule', [0, 1.5, 0.01], [0.018, 0.12, 4, 8]),
  ]),

  // ---- Cardiovascular ----
  central('heart', 'cardiovascular', [mesh('heart', 'sphere', [-0.03, 1.29, 0.02], [0.055, 16, 16])]),
  central('aorta', 'cardiovascular', [
    mesh('aorta', 'capsule', [0, 1.36, -0.01], [0.018, 0.12, 4, 8]),
  ]),
  paired('vascular-network', 'cardiovascular', 'capsule', [0.05, 1.1, 0.04], [0.01, 0.5, 4, 6]),
];

/** Systems that currently have geometry in the model, in display order. */
export const modeledSystems: SystemId[] = [
  'muscular',
  'skeletal',
  'respiratory',
  'cardiovascular',
];

/** Average position of a structure's meshes — used as a camera focus point. */
export function getPartCenter(structureId: string): [number, number, number] | null {
  const part = bodyParts.find((p) => p.structureId === structureId);
  if (!part || part.meshes.length === 0) return null;
  let x = 0;
  let y = 0;
  let z = 0;
  for (const m of part.meshes) {
    x += m.position[0];
    y += m.position[1];
    z += m.position[2];
  }
  const n = part.meshes.length;
  return [x / n, y / n, z / n];
}
