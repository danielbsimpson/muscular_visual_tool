import type { SystemId } from './system';

/** An anatomical structure (muscle, bone, organ, vessel) shown in the viewer. */
export interface Structure {
  /** Stable slug id, e.g. "pectoralis-major". */
  id: string;
  system: SystemId;
  /** Common name. */
  name: string;
  /** Latin / anatomical name. */
  anatomicalName?: string;
  /** Plain-language description. */
  description: string;
  /** Functional role in the body. */
  function: string;
  /** Node/mesh names in the 3D model that make up this structure. */
  meshIds: string[];
  relatedStructureIds?: string[];
  exerciseIds?: string[];
  studyIds?: string[];
}
