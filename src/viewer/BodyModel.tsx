import { useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Material, Mesh, Object3D } from 'three';
import { MeshStandardMaterial } from 'three';
import type { SystemId } from '@/types';
import { useViewerStore } from '@/state/store';
import { bodyParts } from './bodyParts';
import { useAnatomyModel, type AnatomyModel } from './useAnatomyModel';
import { MODELED_SYSTEMS } from './modelManifest';
import type { MeshDef } from './viewer.types';

const SYSTEM_COLOR: Record<SystemId, string> = {
  muscular: '#c0564a',
  skeletal: '#e7ded0',
  respiratory: '#7fb3d5',
  cardiovascular: '#cc4b6a',
};

const HIGHLIGHT = '#38bdf8';
const SELECTED_EMISSIVE = 0.55;
const HOVERED_EMISSIVE = 0.25;
const OPAQUE_DEPTH_WRITE_THRESHOLD = 0.95;

function Primitive({ def }: { def: MeshDef }) {
  switch (def.kind) {
    case 'box':
      return <boxGeometry args={def.args as [number, number, number]} />;
    case 'sphere':
      return <sphereGeometry args={def.args as [number, number, number]} />;
    case 'capsule':
      return <capsuleGeometry args={def.args as [number, number, number, number]} />;
    default:
      return null;
  }
}

/**
 * Procedural mannequin — the fallback geometry used when no GLB asset is
 * available or a load fails (GUD-002). This is the original M1 rendering path.
 */
function ProceduralBody() {
  const selectedId = useViewerStore((s) => s.selectedId);
  const hoveredId = useViewerStore((s) => s.hoveredId);
  const visibleSystems = useViewerStore((s) => s.visibleSystems);
  const systemOpacity = useViewerStore((s) => s.systemOpacity);
  const select = useViewerStore((s) => s.select);
  const hover = useViewerStore((s) => s.hover);

  return (
    <group>
      {bodyParts.map((part) => {
        const isSelected = selectedId === part.structureId;
        const isHovered = hoveredId === part.structureId;
        const opacity = systemOpacity[part.system];
        const visible = visibleSystems[part.system];
        const emissiveIntensity = isSelected
          ? SELECTED_EMISSIVE
          : isHovered
            ? HOVERED_EMISSIVE
            : 0;

        return part.meshes.map((def) => (
          <mesh
            key={def.id}
            position={def.position}
            rotation={def.rotation}
            visible={visible}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              select(part.structureId);
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              hover(part.structureId);
            }}
            onPointerOut={() => hover(null)}
          >
            <Primitive def={def} />
            <meshStandardMaterial
              color={SYSTEM_COLOR[part.system]}
              emissive={emissiveIntensity > 0 ? HIGHLIGHT : '#000000'}
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={opacity}
              depthWrite={opacity > OPAQUE_DEPTH_WRITE_THRESHOLD}
              roughness={0.6}
              metalness={0.05}
            />
          </mesh>
        ));
      })}
    </group>
  );
}

/** Every material attached to an object, normalized to an array. */
function materialsOf(object: Object3D): Material[] {
  const mesh = object as Mesh;
  if (!mesh.isMesh) return [];
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

/** Walk up the hierarchy until a node carries a `structureId` tag. */
function resolveStructureId(object: Object3D | null): string | null {
  let current: Object3D | null = object;
  while (current) {
    const id = current.userData?.structureId;
    if (typeof id === 'string') return id;
    current = current.parent;
  }
  return null;
}

/**
 * Renders the tagged GLB scenes. A single delegated pointer handler on the model
 * root drives selection/hover (PAT-001), while material state (layer visibility,
 * opacity peeling, and emissive highlight) is applied without mutating the shared
 * source materials (RISK-006).
 */
function LoadedBody({ model }: { model: AnatomyModel }) {
  const { scenes, index } = model;
  const selectedId = useViewerStore((s) => s.selectedId);
  const hoveredId = useViewerStore((s) => s.hoveredId);
  const visibleSystems = useViewerStore((s) => s.visibleSystems);
  const systemOpacity = useViewerStore((s) => s.systemOpacity);
  const select = useViewerStore((s) => s.select);
  const hover = useViewerStore((s) => s.hover);

  // Clone materials once per load so overrides never leak into shared assets.
  useEffect(() => {
    for (const objects of index.values()) {
      for (const object of objects) {
        const mesh = object as Mesh;
        if (!mesh.isMesh) continue;
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone();
      }
    }
  }, [index]);

  // Per-system layer visibility + opacity peeling.
  useEffect(() => {
    for (const system of MODELED_SYSTEMS) {
      const scene = scenes[system];
      if (!scene) continue;
      const opacity = systemOpacity[system];
      scene.visible = visibleSystems[system];
      scene.traverse((object) => {
        for (const material of materialsOf(object)) {
          material.transparent = opacity < 1;
          material.opacity = opacity;
          material.depthWrite = opacity > OPAQUE_DEPTH_WRITE_THRESHOLD;
        }
      });
    }
  }, [scenes, visibleSystems, systemOpacity]);

  // Selection / hover highlight — paired (-l/-r) objects both light up.
  useEffect(() => {
    for (const [structureId, objects] of index) {
      const emissiveIntensity =
        structureId === selectedId
          ? SELECTED_EMISSIVE
          : structureId === hoveredId
            ? HOVERED_EMISSIVE
            : 0;
      for (const object of objects) {
        for (const material of materialsOf(object)) {
          if (material instanceof MeshStandardMaterial) {
            material.emissive.set(emissiveIntensity > 0 ? HIGHLIGHT : '#000000');
            material.emissiveIntensity = emissiveIntensity;
          }
        }
      }
    }
  }, [index, selectedId, hoveredId]);

  return (
    <group
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        const id = resolveStructureId(e.object);
        if (!id) return;
        e.stopPropagation();
        select(id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        const id = resolveStructureId(e.object);
        if (!id) return;
        e.stopPropagation();
        hover(id);
      }}
      onPointerOut={() => hover(null)}
    >
      {MODELED_SYSTEMS.map((system) => {
        const scene = scenes[system];
        return scene ? <primitive key={system} object={scene} /> : null;
      })}
    </group>
  );
}

/**
 * Draws the licensed anatomical meshes when they are loaded, and transparently
 * falls back to the procedural mannequin otherwise. All interaction is keyed on
 * `structureId`, so behaviour is identical across both rendering paths.
 */
export function BodyModel() {
  const model = useAnatomyModel();
  if (!model.ready) return <ProceduralBody />;
  return <LoadedBody model={model} />;
}
