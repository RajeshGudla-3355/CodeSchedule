import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Text } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

/**
 * Near-white pastel palette — atmospheric, matte, intentionally non-interactive
 * looking so the chips don't read as clickable buttons.
 */
const LANGS = [
  { label: 'JS',  color: '#f5f3ff', position: [-2.6, 1.2, 0] as const },   // almost-white lavender
  { label: 'PY',  color: '#ede9fe', position: [2.6, 1.2, 0] as const },    // very light lavender
  { label: 'TS',  color: '#eff6ff', position: [-2.2, -1.4, 1] as const },  // almost-white blue
  { label: 'RX',  color: '#ddd6fe', position: [2.2, -1.4, 1] as const },   // light lavender
  { label: 'CSS', color: '#fce7f3', position: [0, 2.2, -1] as const }      // very light pink
];

function Knot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.9, 0.28, 200, 32]} />
      <meshPhysicalMaterial
        color="#e9e7ff"
        metalness={0.05}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive="#c4b5fd"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function LangChip({
  label,
  color,
  position
}: {
  label: string;
  color: string;
  position: readonly [number, number, number];
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.4}>
      <group position={position as unknown as [number, number, number]}>
        <mesh castShadow>
          <boxGeometry args={[0.92, 0.92, 0.18]} />
          <meshStandardMaterial
            color={color}
            metalness={0}
            roughness={0.85}
            emissive={color}
            emissiveIntensity={0.08}
          />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.28}
          color="#3b3764"
          anchorX="center"
          anchorY="middle"
          fontWeight={500}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

function Rig() {
  useFrame((state) => {
    const x = (state.pointer.x * Math.PI) / 18;
    const y = (state.pointer.y * Math.PI) / 26;
    state.camera.position.lerp(
      new THREE.Vector3(Math.sin(x) * 6, 1.2 + y * 1.2, Math.cos(x) * 6),
      0.035
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D() {
  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0, 1, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.45} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#c4b5fd" />
        <pointLight position={[-5, -3, -2]} intensity={0.8} color="#8b5cf6" />

        <Stars radius={45} depth={28} count={700} factor={2} fade speed={0.5} />
        <Knot />
        {LANGS.map((l) => (
          <LangChip key={l.label} label={l.label} color={l.color} position={l.position} />
        ))}
        <Rig />
      </Suspense>
    </Canvas>
  );
}
