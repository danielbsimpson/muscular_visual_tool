import type { ThreeEvent } from '@react-three/fiber';
import type { SystemId } from '@/types';
import { useViewerStore } from '@/state/store';
import { bodyParts } from './bodyParts';
import type { MeshDef } from './viewer.types';

const SYSTEM_COLOR: Record<SystemId, string> = {
  muscular: '#c0564a',
  skeletal: '#e7ded0',
  respiratory: '#7fb3d5',
  cardiovascular: '#cc4b6a',
};

const HIGHLIGHT = '#38bdf8';

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

export function BodyModel() {
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
        const emissiveIntensity = isSelected ? 0.55 : isHovered ? 0.25 : 0;

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
              depthWrite={opacity > 0.95}
              roughness={0.6}
              metalness={0.05}
            />
          </mesh>
        ));
      })}
    </group>
  );
}
