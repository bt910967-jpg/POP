import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { AppState } from '../utils/types';
import { useBlinkAnimation } from '../hooks/useBlinkAnimation';

interface PoopMeshProps {
  appState: AppState;
  volume: number;
  mouthOpen: number;
}

function PoopMesh({ appState, volume, mouthOpen }: PoopMeshProps) {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const mouthMeshRef = useRef<THREE.Mesh>(null);
  const mouthHoleRef = useRef<THREE.Mesh>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  const isBlinking = useBlinkAnimation();
  const isSpeaking = appState === 'listening' || appState === 'playback';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (!rootRef.current) return;

    // Floating
    rootRef.current.position.y = Math.sin(t * 0.85) * 0.13;
    // Idle rotation sway
    rootRef.current.rotation.y = Math.sin(t * 0.45) * 0.09;

    // Breathing base scale
    const breathe = 1 + Math.sin(t * 1.6) * 0.018;
    // Speaking squash-stretch
    const speakScale = isSpeaking ? 1 + volume * 0.07 : 1;
    rootRef.current.scale.setScalar(breathe * speakScale);

    // Body squash
    if (bodyRef.current) {
      const squashY = isSpeaking ? Math.max(0.92, 1 - volume * 0.06) : 1;
      const squashX = isSpeaking ? 1 + (1 - squashY) * 0.4 : 1;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, squashY, 0.15);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, squashX, 0.15);
    }

    // Eyes blink
    const targetBlinkY = isBlinking ? 0.08 : 1.0;
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, targetBlinkY, 0.4);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, targetBlinkY, 0.4);
    }

    // Pupils wander during listening
    if (leftPupilRef.current && rightPupilRef.current) {
      const px = appState === 'listening' ? Math.sin(t * 2.1) * 0.028 : 0;
      const py = appState === 'listening' ? Math.cos(t * 1.7) * 0.018 : 0;
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, -0.23 + px, 0.12);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, 0.40 + py, 0.12);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, 0.23 + px, 0.12);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, 0.40 + py, 0.12);
    }

    // Mouth open
    const targetMouthScaleY = isSpeaking ? 0.06 + mouthOpen * 0.7 : 0.06;
    const targetMouthScaleX = isSpeaking ? 1 + mouthOpen * 0.35 : 1;
    if (mouthMeshRef.current) {
      mouthMeshRef.current.scale.y = THREE.MathUtils.lerp(mouthMeshRef.current.scale.y, targetMouthScaleY, 0.25);
      mouthMeshRef.current.scale.x = THREE.MathUtils.lerp(mouthMeshRef.current.scale.x, targetMouthScaleX, 0.25);
    }
    if (mouthHoleRef.current) {
      const targetHole = isSpeaking ? mouthOpen * 0.9 : 0;
      mouthHoleRef.current.scale.setScalar(THREE.MathUtils.lerp(mouthHoleRef.current.scale.x, targetHole, 0.25));
    }

    // Glow
    if (glowLightRef.current) {
      const targetIntensity = appState === 'listening'
        ? 2 + volume * 6
        : appState === 'playback'
        ? 1.5 + volume * 4
        : 0.2;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(glowLightRef.current.intensity, targetIntensity, 0.1);
    }
  });

  return (
    <group ref={rootRef}>
      {/* Glow point light */}
      <pointLight ref={glowLightRef} color="#FF9500" intensity={0.2} distance={4} decay={2} />

      <group ref={bodyRef}>
        {/* === POOP BODY === */}
        {/* Base - widest, slightly flattened */}
        <mesh position={[0, -0.46, 0]} scale={[1, 0.72, 1]}>
          <sphereGeometry args={[0.85, 48, 48]} />
          <meshStandardMaterial color="#5A2D0C" roughness={0.35} metalness={0.18} />
        </mesh>

        {/* Rim highlight strip on base */}
        <mesh position={[0, -0.35, 0]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.86, 48, 48]} />
          <meshStandardMaterial color="#7B4220" roughness={0.5} metalness={0.05} transparent opacity={0.25} />
        </mesh>

        {/* Level 1 */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.70, 48, 48]} />
          <meshStandardMaterial color="#6B3510" roughness={0.32} metalness={0.18} />
        </mesh>

        {/* Level 2 */}
        <mesh position={[0.07, 0.90, 0]}>
          <sphereGeometry args={[0.50, 48, 48]} />
          <meshStandardMaterial color="#7C4018" roughness={0.28} metalness={0.15} />
        </mesh>

        {/* Tip */}
        <mesh position={[0.19, 1.30, 0]}>
          <sphereGeometry args={[0.30, 48, 48]} />
          <meshStandardMaterial color="#8B4A20" roughness={0.25} metalness={0.12} />
        </mesh>

        {/* Tip nub */}
        <mesh position={[0.28, 1.56, -0.04]}>
          <sphereGeometry args={[0.14, 32, 32]} />
          <meshStandardMaterial color="#9A5528" roughness={0.22} metalness={0.1} />
        </mesh>

        {/* === FACE === */}

        {/* LEFT EYE white */}
        <mesh ref={leftEyeRef} position={[-0.24, 0.40, 0.65]}>
          <sphereGeometry args={[0.118, 24, 24]} />
          <meshStandardMaterial color="#F8F8F8" roughness={0.1} metalness={0.05} />
        </mesh>
        {/* LEFT pupil */}
        <mesh ref={leftPupilRef} position={[-0.23, 0.40, 0.76]}>
          <sphereGeometry args={[0.058, 16, 16]} />
          <meshStandardMaterial color="#100808" roughness={0.8} />
        </mesh>
        {/* LEFT eye shine */}
        <mesh position={[-0.20, 0.44, 0.775]}>
          <sphereGeometry args={[0.020, 10, 10]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.05} emissive="#FFFFFF" emissiveIntensity={0.5} />
        </mesh>

        {/* RIGHT EYE white */}
        <mesh ref={rightEyeRef} position={[0.24, 0.40, 0.65]}>
          <sphereGeometry args={[0.118, 24, 24]} />
          <meshStandardMaterial color="#F8F8F8" roughness={0.1} metalness={0.05} />
        </mesh>
        {/* RIGHT pupil */}
        <mesh ref={rightPupilRef} position={[0.23, 0.40, 0.76]}>
          <sphereGeometry args={[0.058, 16, 16]} />
          <meshStandardMaterial color="#100808" roughness={0.8} />
        </mesh>
        {/* RIGHT eye shine */}
        <mesh position={[0.27, 0.44, 0.775]}>
          <sphereGeometry args={[0.020, 10, 10]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.05} emissive="#FFFFFF" emissiveIntensity={0.5} />
        </mesh>

        {/* LEFT eyebrow */}
        <mesh position={[-0.24, 0.535, 0.62]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.14, 0.025, 0.025]} />
          <meshStandardMaterial color="#2D1500" roughness={0.8} />
        </mesh>
        {/* RIGHT eyebrow */}
        <mesh position={[0.24, 0.535, 0.62]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.14, 0.025, 0.025]} />
          <meshStandardMaterial color="#2D1500" roughness={0.8} />
        </mesh>

        {/* MOUTH - dark hole (speaking oval) */}
        <mesh ref={mouthHoleRef} position={[0.01, 0.17, 0.680]} scale={[0, 0, 0]}>
          <circleGeometry args={[0.14, 32]} />
          <meshStandardMaterial color="#0A0400" side={THREE.DoubleSide} />
        </mesh>

        {/* MOUTH - smile torus outline */}
        <mesh
          ref={mouthMeshRef}
          position={[0.01, 0.17, 0.675]}
          scale={[1, 0.06, 0.5]}
        >
          <torusGeometry args={[0.13, 0.038, 12, 48, Math.PI]} />
          <meshStandardMaterial color="#2A1200" roughness={0.6} />
        </mesh>

        {/* Cheek blush LEFT */}
        <mesh position={[-0.38, 0.28, 0.56]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#C06040" roughness={1} transparent opacity={0.45} />
        </mesh>
        {/* Cheek blush RIGHT */}
        <mesh position={[0.38, 0.28, 0.56]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#C06040" roughness={1} transparent opacity={0.45} />
        </mesh>
      </group>
    </group>
  );
}

interface PoopCharacter3DProps {
  appState: AppState;
  volume: number;
  mouthOpen: number;
}

export function PoopCharacter3D({ appState, volume, mouthOpen }: PoopCharacter3DProps) {
  const isActive = appState === 'listening' || appState === 'playback';

  return (
    <div className="relative w-full h-full">
      {/* Glow ring behind canvas */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className={`rounded-full transition-all duration-700 ${isActive ? 'glow-pulse' : ''}`}
          style={{
            width: '280px',
            height: '280px',
            background: isActive
              ? 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 4.2], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={0.9} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.25} color="#6688AA" />
        <pointLight position={[0, 3, 2.5]} intensity={0.5} color="#FFB347" />

        <Suspense fallback={null}>
          <PoopMesh appState={appState} volume={volume} mouthOpen={mouthOpen} />
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.35}
            scale={4}
            blur={2.5}
            far={3}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
