import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Group, Mesh, SphereGeometry, MeshStandardMaterial } from 'three';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { useViewerStore } from '@/state/store';
import { tagScene } from './tagStructures';
import type { AnatomyModel } from './useAnatomyModel';

// The model hook is mocked so we can drive the loaded vs. fallback branches
// without fetching real GLB assets.
const hookState = vi.hoisted(() => ({ current: null as AnatomyModel | null }));

vi.mock('./useAnatomyModel', () => ({
  useAnatomyModel: () => hookState.current,
  preloadAnatomyModel: () => {},
}));

// Import after the mock is registered.
import { BodyModel } from './BodyModel';

type Renderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

/** The delegated pointer-handling wrapper group is the scene's first child. */
function rootGroup(renderer: Renderer) {
  const root = renderer.scene.children[0];
  if (!root) throw new Error('expected a root group in the rendered scene');
  return root;
}

function buildLoadedModel(): { model: AnatomyModel; heart: Mesh } {
  const scene = new Group();
  const heart = new Mesh(new SphereGeometry(0.05, 8, 8), new MeshStandardMaterial());
  heart.name = 'heart';
  scene.add(heart);
  const index = tagScene(scene, { heart: 'heart' }, 'cardiovascular');
  return {
    model: { scenes: { cardiovascular: scene }, index, ready: true, error: null },
    heart,
  };
}

describe('BodyModel', () => {
  beforeEach(() => {
    useViewerStore.setState({ selectedId: null, hoveredId: null });
  });

  it('selects the structure when a tagged object is clicked', async () => {
    const { model, heart } = buildLoadedModel();
    hookState.current = model;

    const renderer = await ReactThreeTestRenderer.create(<BodyModel />);
    const root = rootGroup(renderer);

    await renderer.fireEvent(root, 'pointerDown', {
      object: heart,
      stopPropagation: () => {},
    });

    expect(useViewerStore.getState().selectedId).toBe('heart');
  });

  it('hovers the structure on pointer over and clears it on pointer out', async () => {
    const { model, heart } = buildLoadedModel();
    hookState.current = model;

    const renderer = await ReactThreeTestRenderer.create(<BodyModel />);
    const root = rootGroup(renderer);

    await renderer.fireEvent(root, 'pointerOver', {
      object: heart,
      stopPropagation: () => {},
    });
    expect(useViewerStore.getState().hoveredId).toBe('heart');

    await renderer.fireEvent(root, 'pointerOut', { object: heart });
    expect(useViewerStore.getState().hoveredId).toBeNull();
  });

  it('renders the procedural mannequin fallback when the model fails to load', async () => {
    hookState.current = { scenes: {}, index: new Map(), ready: false, error: new Error('boom') };

    const renderer = await ReactThreeTestRenderer.create(<BodyModel />);
    const meshes = renderer.scene.findAllByType('Mesh');

    expect(meshes.length).toBeGreaterThan(0);
  });
});
