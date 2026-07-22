import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useViewerStore } from '@/state/store';
import { BodyModel } from './BodyModel';
import { CameraRig } from './CameraRig';

export function Scene() {
  const select = useViewerStore((s) => s.select);

  return (
    <Canvas
      camera={{ position: [0, 1.3, 2.2], fov: 45, near: 0.1, far: 50 }}
      dpr={[1, 2]}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#0b1220']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-3, 2, -4]} intensity={0.4} />
      <BodyModel />
      <CameraRig />
      <OrbitControls
        makeDefault
        target={[0, 1.1, 0]}
        enablePan
        minDistance={0.6}
        maxDistance={5}
      />
    </Canvas>
  );
}
