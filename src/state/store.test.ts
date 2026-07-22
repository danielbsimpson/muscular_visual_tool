import { describe, it, expect, beforeEach } from 'vitest';
import { useViewerStore } from './store';

describe('viewer store', () => {
  beforeEach(() => {
    useViewerStore.setState({
      selectedId: null,
      hoveredId: null,
      visibleSystems: { muscular: true, skeletal: true, respiratory: false, cardiovascular: false },
      systemOpacity: { muscular: 1, skeletal: 1, respiratory: 1, cardiovascular: 1 },
    });
  });

  it('selects and clears a structure', () => {
    useViewerStore.getState().select('femur');
    expect(useViewerStore.getState().selectedId).toBe('femur');
    useViewerStore.getState().select(null);
    expect(useViewerStore.getState().selectedId).toBeNull();
  });

  it('toggles system visibility', () => {
    useViewerStore.getState().toggleSystem('muscular');
    expect(useViewerStore.getState().visibleSystems.muscular).toBe(false);
  });

  it('sets per-system opacity', () => {
    useViewerStore.getState().setOpacity('skeletal', 0.5);
    expect(useViewerStore.getState().systemOpacity.skeletal).toBe(0.5);
  });
});
