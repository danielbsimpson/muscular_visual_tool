import type { SystemId } from '@/types';

/** Primitive geometry kinds used to approximate anatomical structures. */
export type MeshKind = 'box' | 'sphere' | 'capsule';

/** A single primitive mesh belonging to a body part. */
export interface MeshDef {
  id: string;
  kind: MeshKind;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Geometry constructor args (box: [w,h,d], sphere: [r,ws,hs], capsule: [r,len,cs,rs]). */
  args: number[];
}

/** A renderable anatomical structure composed of one or more primitive meshes. */
export interface BodyPart {
  structureId: string;
  system: SystemId;
  meshes: MeshDef[];
}
