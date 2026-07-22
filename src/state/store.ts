import { create } from 'zustand';
import type { SystemId } from '@/types';

type SystemFlags = Record<SystemId, boolean>;
type SystemNumbers = Record<SystemId, number>;

export interface ViewerState {
  /** Currently selected structure id, or null. */
  selectedId: string | null;
  /** Structure id currently hovered in the 3D view, or null. */
  hoveredId: string | null;
  /** Whether each body system is rendered. */
  visibleSystems: SystemFlags;
  /** Per-system opacity (0–1) for peeling layers. */
  systemOpacity: SystemNumbers;

  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  toggleSystem: (system: SystemId) => void;
  setOpacity: (system: SystemId, value: number) => void;
}

const allSystems = (value: boolean): SystemFlags => ({
  muscular: value,
  skeletal: value,
  respiratory: value,
  cardiovascular: value,
});

export const useViewerStore = create<ViewerState>((set) => ({
  selectedId: null,
  hoveredId: null,
  visibleSystems: { ...allSystems(false), muscular: true, skeletal: true },
  systemOpacity: { muscular: 1, skeletal: 1, respiratory: 1, cardiovascular: 1 },

  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  toggleSystem: (system) =>
    set((state) => ({
      visibleSystems: { ...state.visibleSystems, [system]: !state.visibleSystems[system] },
    })),
  setOpacity: (system, value) =>
    set((state) => ({
      systemOpacity: { ...state.systemOpacity, [system]: value },
    })),
}));
