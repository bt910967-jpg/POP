import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AppState, CharacterType } from '../utils/types';
import { useBlinkAnimation } from '../hooks/useBlinkAnimation';

// ─── Shared mesh interface ───────────────────────────────────────────────────

interface MeshProps {
  appState: AppState;
  volume: number;
  mouthOpen: number;
}

// ─── Smooth show/hide wrapper ─────────────────────────────────────────────────
// Scales child mesh in (1) or out (0) with lerp so switching feels fluid.

function CharacterSwitch({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const activeRef = useRef(isActive);

  useEffect(() => { activeRef.current = isActive; }, [isActive]);

  useFrame(() => {
    if (!ref.current) return;
    const target = activeRef.current ? 1 : 0;
    const next = THREE.MathUtils.lerp(ref.current.scale.x, target, 0.18);
    ref.current.scale.setScalar(next);
    ref.current.visible = next > 0.02 || activeRef.current;
  });

  return <group ref={ref} scale={isActive ? 1 : 0}>{children}</group>;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. CHICK
// ════════════════════════════════════════════════════════════════════════════

const C_YELLOW       = '#FFD93D';
const C_YELLOW_DARK  = '#F5B800';
const C_YELLOW_LIGHT = '#FFF5A8';
const C_ORANGE       = '#FF8C00';
const C_BEAK         = '#FF7700';
const C_EYE_DARK     = '#120A02';

function ChickMesh({ appState, volume, mouthOpen }: MeshProps) {
  const rootRef       = useRef<THREE.Group>(null);
  const bodyRef       = useRef<THREE.Group>(null);
  const leftEyeRef    = useRef<THREE.Mesh>(null);
  const rightEyeRef   = useRef<THREE.Mesh>(null);
  const leftPupilRef  = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftWingRef   = useRef<THREE.Mesh>(null);
  const rightWingRef  = useRef<THREE.Mesh>(null);
  const beakLowerRef  = useRef<THREE.Mesh>(null);
  const tailGroupRef  = useRef<THREE.Group>(null);
  const glowRef       = useRef<THREE.PointLight>(null);

  const isBlinking = useBlinkAnimation();
  const isSpeaking = appState === 'listening' || appState === 'playback';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootRef.current) return;

    rootRef.current.position.y = Math.sin(t * 1.3) * 0.09;
    rootRef.current.rotation.y = Math.sin(t * 0.55) * 0.08;

    const breathe    = 1 + Math.sin(t * 1.9) * 0.016;
    const speakScale = isSpeaking ? 1 + volume * 0.055 : 1;
    rootRef.current.scale.setScalar(breathe * speakScale);

    if (bodyRef.current) {
      const sqY = isSpeaking ? Math.max(0.93, 1 - volume * 0.055) : 1;
      const sqX = isSpeaking ? 1 + (1 - sqY) * 0.5 : 1;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, sqY, 0.15);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, sqX, 0.15);
    }

    const blinkT = isBlinking ? 0.05 : 1.0;
    if (leftEyeRef.current)  leftEyeRef.current.scale.y  = THREE.MathUtils.lerp(leftEyeRef.current.scale.y,  blinkT, 0.38);
    if (rightEyeRef.current) rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkT, 0.38);

    if (leftPupilRef.current && rightPupilRef.current) {
      const px = appState === 'listening' ? Math.sin(t * 2.3) * 0.026 : 0;
      const py = appState === 'listening' ? Math.cos(t * 1.9) * 0.016 : 0;
      leftPupilRef.current.position.x  = THREE.MathUtils.lerp(leftPupilRef.current.position.x,  -0.23 + px, 0.12);
      leftPupilRef.current.position.y  = THREE.MathUtils.lerp(leftPupilRef.current.position.y,   0.90 + py, 0.12);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x,  0.23 + px, 0.12);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y,  0.90 + py, 0.12);
    }

    const idleFlap  = Math.sin(t * 2.2) * 0.18;
    const speakFlap = isSpeaking ? Math.sin(t * 7.0) * 0.38 * volume : 0;
    if (leftWingRef.current)  leftWingRef.current.rotation.z  = THREE.MathUtils.lerp(leftWingRef.current.rotation.z,   0.55 + idleFlap + speakFlap, 0.12);
    if (rightWingRef.current) rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, -0.55 - idleFlap - speakFlap, 0.12);

    if (tailGroupRef.current) {
      const wag = isSpeaking ? Math.sin(t * 8.0) * 0.14 * volume : Math.sin(t * 1.5) * 0.04;
      tailGroupRef.current.rotation.z = THREE.MathUtils.lerp(tailGroupRef.current.rotation.z, wag, 0.14);
    }

    if (beakLowerRef.current) {
      const tY = isSpeaking ? 0.79 - mouthOpen * 0.18 : 0.79;
      beakLowerRef.current.position.y = THREE.MathUtils.lerp(beakLowerRef.current.position.y, tY, 0.25);
    }

    if (glowRef.current) {
      const tI = appState === 'listening' ? 2.5 + volume * 5 : appState === 'playback' ? 1.8 + volume * 4 : 0.2;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, tI, 0.1);
    }
  });

  return (
    <group ref={rootRef}>
      <pointLight ref={glowRef} color="#FFE680" intensity={0.2} distance={4} decay={2} />
      <group ref={bodyRef}>
        <mesh position={[0, -0.08, 0]} scale={[1, 0.91, 1]}>
          <sphereGeometry args={[0.72, 32, 32]} />
          <meshStandardMaterial color={C_YELLOW} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.16, 0.56]} scale={[0.68, 0.80, 0.34]}>
          <sphereGeometry args={[0.72, 24, 24]} />
          <meshStandardMaterial color={C_YELLOW_LIGHT} roughness={0.9} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshStandardMaterial color={C_YELLOW} roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.38, 0]} scale={[0.88, 0.44, 0.82]}>
          <sphereGeometry args={[0.58, 20, 20]} />
          <meshStandardMaterial color={C_YELLOW} roughness={0.75} />
        </mesh>
        {/* Tuft */}
        <mesh position={[ 0.04, 1.38,  0.04]} scale={[0.20, 0.32, 0.18]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_YELLOW_DARK} roughness={0.82} /></mesh>
        <mesh position={[-0.09, 1.35,  0.02]} scale={[0.17, 0.28, 0.15]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_YELLOW}      roughness={0.82} /></mesh>
        <mesh position={[ 0.12, 1.32,  0.00]} scale={[0.14, 0.23, 0.12]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_YELLOW_DARK} roughness={0.82} /></mesh>
        {/* Beak */}
        <mesh position={[0, 0.86, 0.51]} scale={[0.23, 0.11, 0.27]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={C_BEAK} roughness={0.40} metalness={0.06} />
        </mesh>
        <mesh ref={beakLowerRef} position={[0, 0.79, 0.51]} scale={[0.20, 0.09, 0.23]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={C_ORANGE} roughness={0.40} metalness={0.06} />
        </mesh>
        {/* Left eye */}
        <mesh ref={leftEyeRef} position={[-0.23, 0.90, 0.44]}><sphereGeometry args={[0.105, 20, 20]} /><meshStandardMaterial color="#FAFAFA" roughness={0.08} /></mesh>
        <mesh ref={leftPupilRef} position={[-0.23, 0.90, 0.535]}><sphereGeometry args={[0.050, 14, 14]} /><meshStandardMaterial color={C_EYE_DARK} roughness={0.9} /></mesh>
        <mesh position={[-0.212, 0.926, 0.542]}><sphereGeometry args={[0.017, 8, 8]} /><meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1.2} roughness={0} /></mesh>
        <mesh position={[-0.38, 0.76, 0.36]} scale={[0.13, 0.08, 0.055]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color="#FF9999" roughness={1} transparent opacity={0.38} /></mesh>
        {/* Right eye */}
        <mesh ref={rightEyeRef} position={[0.23, 0.90, 0.44]}><sphereGeometry args={[0.105, 20, 20]} /><meshStandardMaterial color="#FAFAFA" roughness={0.08} /></mesh>
        <mesh ref={rightPupilRef} position={[0.23, 0.90, 0.535]}><sphereGeometry args={[0.050, 14, 14]} /><meshStandardMaterial color={C_EYE_DARK} roughness={0.9} /></mesh>
        <mesh position={[0.248, 0.926, 0.542]}><sphereGeometry args={[0.017, 8, 8]} /><meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1.2} roughness={0} /></mesh>
        <mesh position={[0.38, 0.76, 0.36]} scale={[0.13, 0.08, 0.055]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color="#FF9999" roughness={1} transparent opacity={0.38} /></mesh>
        {/* Eyebrows */}
        <mesh position={[-0.23, 1.020, 0.41]} rotation={[0.10, 0,  0.28]}><boxGeometry args={[0.12, 0.022, 0.022]} /><meshStandardMaterial color="#D4A000" roughness={0.8} /></mesh>
        <mesh position={[ 0.23, 1.020, 0.41]} rotation={[0.10, 0, -0.28]}><boxGeometry args={[0.12, 0.022, 0.022]} /><meshStandardMaterial color="#D4A000" roughness={0.8} /></mesh>
        {/* Wings */}
        <mesh ref={leftWingRef}  position={[-0.80, -0.04, 0.0]} rotation={[0.14, -0.05,  0.55]} scale={[0.54, 0.42, 0.28]}><sphereGeometry args={[1, 20, 20]} /><meshStandardMaterial color={C_YELLOW_DARK} roughness={0.65} /></mesh>
        <mesh ref={rightWingRef} position={[ 0.80, -0.04, 0.0]} rotation={[0.14,  0.05, -0.55]} scale={[0.54, 0.42, 0.28]}><sphereGeometry args={[1, 20, 20]} /><meshStandardMaterial color={C_YELLOW_DARK} roughness={0.65} /></mesh>
        {/* Tail */}
        <group ref={tailGroupRef} position={[0, 0.12, -0.72]}>
          <mesh rotation={[-0.55, 0, 0]} scale={[0.36, 0.54, 0.22]}><sphereGeometry args={[1, 16, 16]} /><meshStandardMaterial color={C_YELLOW_DARK} roughness={0.72} /></mesh>
          <mesh position={[ 0.08, 0.18, -0.08]} rotation={[-0.62, 0,  0.08]} scale={[0.18, 0.42, 0.15]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_YELLOW} roughness={0.72} /></mesh>
          <mesh position={[-0.09, 0.16, -0.07]} rotation={[-0.58, 0, -0.08]} scale={[0.16, 0.38, 0.13]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_YELLOW} roughness={0.72} /></mesh>
        </group>
        {/* Legs */}
        <mesh position={[-0.22, -0.76, 0.05]}><cylinderGeometry args={[0.045, 0.038, 0.28, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.48} metalness={0.06} /></mesh>
        <mesh position={[ 0.22, -0.76, 0.05]}><cylinderGeometry args={[0.045, 0.038, 0.28, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.48} metalness={0.06} /></mesh>
        {/* Left foot */}
        <mesh position={[-0.22, -0.92, 0.16]} rotation={[0.28, 0, 0]} scale={[0.22, 0.09, 0.34]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_ORANGE} roughness={0.48} metalness={0.06} /></mesh>
        <mesh position={[-0.14, -0.93, 0.30]} rotation={[0.20, -0.28, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
        <mesh position={[-0.22, -0.93, 0.32]} rotation={[0.20,  0.00, 0]} scale={[0.07, 0.05, 0.24]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
        <mesh position={[-0.30, -0.93, 0.29]} rotation={[0.20,  0.28, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
        {/* Right foot */}
        <mesh position={[0.22, -0.92, 0.16]} rotation={[0.28, 0, 0]} scale={[0.22, 0.09, 0.34]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={C_ORANGE} roughness={0.48} metalness={0.06} /></mesh>
        <mesh position={[0.30, -0.93, 0.30]} rotation={[0.20,  0.28, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
        <mesh position={[0.22, -0.93, 0.32]} rotation={[0.20,  0.00, 0]} scale={[0.07, 0.05, 0.24]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
        <mesh position={[0.14, -0.93, 0.29]} rotation={[0.20, -0.28, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={C_ORANGE} roughness={0.5} /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. WIDE POOP
// ════════════════════════════════════════════════════════════════════════════

const P_BROWN      = '#6B3510';
const P_BROWN_MID  = '#7C4018';
const P_BROWN_LITE = '#8B4A20';

function PoopMesh({ appState, volume, mouthOpen }: MeshProps) {
  const rootRef       = useRef<THREE.Group>(null);
  const bodyRef       = useRef<THREE.Group>(null);
  const leftEyeRef    = useRef<THREE.Mesh>(null);
  const rightEyeRef   = useRef<THREE.Mesh>(null);
  const leftPupilRef  = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const mouthRef      = useRef<THREE.Mesh>(null);
  const mouthHoleRef  = useRef<THREE.Mesh>(null);
  const glowRef       = useRef<THREE.PointLight>(null);

  const isBlinking = useBlinkAnimation();
  const isSpeaking = appState === 'listening' || appState === 'playback';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootRef.current) return;

    rootRef.current.position.y = Math.sin(t * 1.0) * 0.06;
    rootRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;

    const breathe    = 1 + Math.sin(t * 1.5) * 0.014;
    const speakScale = isSpeaking ? 1 + volume * 0.05 : 1;
    rootRef.current.scale.setScalar(breathe * speakScale);

    if (bodyRef.current) {
      const sqY = isSpeaking ? Math.max(0.94, 1 - volume * 0.045) : 1;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, sqY, 0.15);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, isSpeaking ? 1 + (1 - sqY) * 0.4 : 1, 0.15);
    }

    const blinkT = isBlinking ? 0.08 : 1.0;
    if (leftEyeRef.current)  leftEyeRef.current.scale.y  = THREE.MathUtils.lerp(leftEyeRef.current.scale.y,  blinkT, 0.4);
    if (rightEyeRef.current) rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkT, 0.4);

    if (leftPupilRef.current && rightPupilRef.current) {
      const px = appState === 'listening' ? Math.sin(t * 2.1) * 0.030 : 0;
      const py = appState === 'listening' ? Math.cos(t * 1.7) * 0.020 : 0;
      leftPupilRef.current.position.x  = THREE.MathUtils.lerp(leftPupilRef.current.position.x,  -0.32 + px, 0.12);
      leftPupilRef.current.position.y  = THREE.MathUtils.lerp(leftPupilRef.current.position.y,   0.38 + py, 0.12);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x,  0.32 + px, 0.12);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y,  0.38 + py, 0.12);
    }

    if (mouthRef.current) {
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, isSpeaking ? 0.06 + mouthOpen * 0.7 : 0.06, 0.25);
      mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, isSpeaking ? 1 + mouthOpen * 0.35 : 1, 0.25);
    }
    if (mouthHoleRef.current) {
      const th = isSpeaking ? mouthOpen * 0.9 : 0;
      mouthHoleRef.current.scale.setScalar(THREE.MathUtils.lerp(mouthHoleRef.current.scale.x, th, 0.25));
    }

    if (glowRef.current) {
      const tI = appState === 'listening' ? 2 + volume * 5 : appState === 'playback' ? 1.5 + volume * 3.5 : 0.15;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, tI, 0.1);
    }
  });

  return (
    <group ref={rootRef}>
      <pointLight ref={glowRef} color="#FF9500" intensity={0.15} distance={4} decay={2} />
      <group ref={bodyRef}>
        {/* Wide base */}
        <mesh position={[0, -0.52, 0]} scale={[1.35, 0.72, 1.35]}>
          <sphereGeometry args={[0.86, 48, 48]} />
          <meshStandardMaterial color={P_BROWN} roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0, -0.38, 0]} scale={[1.36, 0.38, 1.36]}>
          <sphereGeometry args={[0.87, 48, 48]} />
          <meshStandardMaterial color="#7B4220" roughness={0.5} transparent opacity={0.22} />
        </mesh>
        {/* Level 1 */}
        <mesh position={[0, 0.26, 0]} scale={[1.22, 1, 1.22]}>
          <sphereGeometry args={[0.70, 48, 48]} />
          <meshStandardMaterial color={P_BROWN_MID} roughness={0.32} metalness={0.15} />
        </mesh>
        {/* Level 2 */}
        <mesh position={[0.07, 0.82, 0]} scale={[1.1, 1, 1.1]}>
          <sphereGeometry args={[0.50, 48, 48]} />
          <meshStandardMaterial color="#7C4018" roughness={0.28} metalness={0.13} />
        </mesh>
        {/* Tip */}
        <mesh position={[0.16, 1.22, 0]}>
          <sphereGeometry args={[0.30, 48, 48]} />
          <meshStandardMaterial color={P_BROWN_LITE} roughness={0.25} metalness={0.10} />
        </mesh>
        <mesh position={[0.24, 1.46, -0.04]}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshStandardMaterial color="#9A5528" roughness={0.22} metalness={0.08} />
        </mesh>
        {/* Left eye */}
        <mesh ref={leftEyeRef} position={[-0.32, 0.38, 0.78]}>
          <sphereGeometry args={[0.135, 24, 24]} />
          <meshStandardMaterial color="#F8F8F8" roughness={0.1} />
        </mesh>
        <mesh ref={leftPupilRef} position={[-0.32, 0.38, 0.905]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#100808" roughness={0.8} />
        </mesh>
        <mesh position={[-0.296, 0.410, 0.914]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} roughness={0} />
        </mesh>
        {/* Right eye */}
        <mesh ref={rightEyeRef} position={[0.32, 0.38, 0.78]}>
          <sphereGeometry args={[0.135, 24, 24]} />
          <meshStandardMaterial color="#F8F8F8" roughness={0.1} />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.32, 0.38, 0.905]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial color="#100808" roughness={0.8} />
        </mesh>
        <mesh position={[0.344, 0.410, 0.914]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={0.5} roughness={0} />
        </mesh>
        {/* Eyebrows */}
        <mesh position={[-0.32, 0.535, 0.755]} rotation={[0, 0,  0.32]}><boxGeometry args={[0.16, 0.028, 0.028]} /><meshStandardMaterial color="#2D1500" roughness={0.8} /></mesh>
        <mesh position={[ 0.32, 0.535, 0.755]} rotation={[0, 0, -0.32]}><boxGeometry args={[0.16, 0.028, 0.028]} /><meshStandardMaterial color="#2D1500" roughness={0.8} /></mesh>
        {/* Cheek blush */}
        <mesh position={[-0.52, 0.26, 0.62]} scale={[0.10, 0.08, 0.07]}><sphereGeometry args={[1, 12, 12]} /><meshStandardMaterial color="#C06040" roughness={1} transparent opacity={0.38} /></mesh>
        <mesh position={[ 0.52, 0.26, 0.62]} scale={[0.10, 0.08, 0.07]}><sphereGeometry args={[1, 12, 12]} /><meshStandardMaterial color="#C06040" roughness={1} transparent opacity={0.38} /></mesh>
        {/* Mouth */}
        <mesh ref={mouthHoleRef} position={[0.01, 0.15, 0.800]} scale={[0, 0, 0]}>
          <circleGeometry args={[0.16, 32]} />
          <meshStandardMaterial color="#0A0400" side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={mouthRef} position={[0.01, 0.15, 0.795]} scale={[1, 0.06, 0.5]}>
          <torusGeometry args={[0.155, 0.04, 12, 48, Math.PI]} />
          <meshStandardMaterial color="#2A1200" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. PENGUIN
// ════════════════════════════════════════════════════════════════════════════

const PG_BODY   = '#1A1A2E';
const PG_TUMMY  = '#F0F0F5';
const PG_ORANGE = '#FF8C00';
const PG_BEAK   = '#FF7000';

function PenguinMesh({ appState, volume, mouthOpen }: MeshProps) {
  const rootRef       = useRef<THREE.Group>(null);
  const bodyRef       = useRef<THREE.Group>(null);
  const leftEyeRef    = useRef<THREE.Mesh>(null);
  const rightEyeRef   = useRef<THREE.Mesh>(null);
  const leftPupilRef  = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const beakLowerRef  = useRef<THREE.Mesh>(null);
  const leftWingRef   = useRef<THREE.Mesh>(null);
  const rightWingRef  = useRef<THREE.Mesh>(null);
  const glowRef       = useRef<THREE.PointLight>(null);

  const isBlinking = useBlinkAnimation();
  const isSpeaking = appState === 'listening' || appState === 'playback';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootRef.current) return;

    rootRef.current.position.y = Math.sin(t * 0.9) * 0.07;
    rootRef.current.rotation.z = Math.sin(t * 0.6) * 0.05;
    rootRef.current.rotation.y = Math.sin(t * 0.45) * 0.06;

    const breathe    = 1 + Math.sin(t * 1.6) * 0.015;
    const speakScale = isSpeaking ? 1 + volume * 0.05 : 1;
    rootRef.current.scale.setScalar(breathe * speakScale);

    if (bodyRef.current) {
      const sqY = isSpeaking ? Math.max(0.94, 1 - volume * 0.04) : 1;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, sqY, 0.12);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, isSpeaking ? 1 + (1 - sqY) * 0.4 : 1, 0.12);
    }

    const blinkT = isBlinking ? 0.06 : 1.0;
    if (leftEyeRef.current)  leftEyeRef.current.scale.y  = THREE.MathUtils.lerp(leftEyeRef.current.scale.y,  blinkT, 0.38);
    if (rightEyeRef.current) rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkT, 0.38);

    if (leftPupilRef.current && rightPupilRef.current) {
      const px = appState === 'listening' ? Math.sin(t * 2.2) * 0.022 : 0;
      const py = appState === 'listening' ? Math.cos(t * 1.8) * 0.014 : 0;
      leftPupilRef.current.position.x  = THREE.MathUtils.lerp(leftPupilRef.current.position.x,  -0.18 + px, 0.12);
      leftPupilRef.current.position.y  = THREE.MathUtils.lerp(leftPupilRef.current.position.y,   0.94 + py, 0.12);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x,  0.18 + px, 0.12);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y,  0.94 + py, 0.12);
    }

    const wingSwing = Math.sin(t * 1.8) * 0.12;
    const speakWing = isSpeaking ? Math.sin(t * 5) * 0.25 * volume : 0;
    if (leftWingRef.current)  leftWingRef.current.rotation.z  = THREE.MathUtils.lerp(leftWingRef.current.rotation.z,   0.25 + wingSwing + speakWing, 0.10);
    if (rightWingRef.current) rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, -0.25 - wingSwing - speakWing, 0.10);

    if (beakLowerRef.current) {
      const tY = isSpeaking ? 0.82 - mouthOpen * 0.14 : 0.82;
      beakLowerRef.current.position.y = THREE.MathUtils.lerp(beakLowerRef.current.position.y, tY, 0.25);
    }

    if (glowRef.current) {
      const tI = appState === 'listening' ? 2 + volume * 4 : appState === 'playback' ? 1.5 + volume * 3 : 0.15;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, tI, 0.1);
    }
  });

  return (
    <group ref={rootRef}>
      <pointLight ref={glowRef} color="#AACCFF" intensity={0.15} distance={4} decay={2} />
      <group ref={bodyRef}>
        {/* Body */}
        <mesh position={[0, -0.05, 0]} scale={[1, 1.08, 1]}>
          <sphereGeometry args={[0.70, 32, 32]} />
          <meshStandardMaterial color={PG_BODY} roughness={0.75} metalness={0.08} />
        </mesh>
        {/* White tummy */}
        <mesh position={[0, -0.12, 0.52]} scale={[0.62, 0.82, 0.36]}>
          <sphereGeometry args={[0.70, 24, 24]} />
          <meshStandardMaterial color={PG_TUMMY} roughness={0.85} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.86, 0]}>
          <sphereGeometry args={[0.48, 32, 32]} />
          <meshStandardMaterial color={PG_BODY} roughness={0.72} metalness={0.06} />
        </mesh>
        {/* White face patch */}
        <mesh position={[0, 0.84, 0.34]} scale={[0.62, 0.58, 0.36]}>
          <sphereGeometry args={[0.48, 24, 24]} />
          <meshStandardMaterial color={PG_TUMMY} roughness={0.80} />
        </mesh>
        {/* Head-body neck */}
        <mesh position={[0, 0.44, 0]} scale={[0.85, 0.40, 0.82]}>
          <sphereGeometry args={[0.58, 20, 20]} />
          <meshStandardMaterial color={PG_BODY} roughness={0.75} />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.88, 0.46]} scale={[0.18, 0.09, 0.22]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={PG_BEAK} roughness={0.38} metalness={0.08} />
        </mesh>
        <mesh ref={beakLowerRef} position={[0, 0.82, 0.46]} scale={[0.16, 0.07, 0.19]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={PG_ORANGE} roughness={0.38} metalness={0.08} />
        </mesh>
        {/* Left eye */}
        <mesh ref={leftEyeRef} position={[-0.18, 0.94, 0.40]}>
          <sphereGeometry args={[0.095, 18, 18]} />
          <meshStandardMaterial color="#FAFAFA" roughness={0.08} />
        </mesh>
        <mesh ref={leftPupilRef} position={[-0.18, 0.94, 0.488]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color="#080408" roughness={0.9} />
        </mesh>
        <mesh position={[-0.164, 0.960, 0.494]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1.2} roughness={0} />
        </mesh>
        {/* Right eye */}
        <mesh ref={rightEyeRef} position={[0.18, 0.94, 0.40]}>
          <sphereGeometry args={[0.095, 18, 18]} />
          <meshStandardMaterial color="#FAFAFA" roughness={0.08} />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.18, 0.94, 0.488]}>
          <sphereGeometry args={[0.045, 14, 14]} />
          <meshStandardMaterial color="#080408" roughness={0.9} />
        </mesh>
        <mesh position={[0.196, 0.960, 0.494]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={1.2} roughness={0} />
        </mesh>
        {/* Wings */}
        <mesh ref={leftWingRef}  position={[-0.76, 0.02, 0.05]} rotation={[0.1, -0.1,  0.25]} scale={[0.22, 0.52, 0.18]}><sphereGeometry args={[1, 18, 18]} /><meshStandardMaterial color={PG_BODY} roughness={0.72} metalness={0.08} /></mesh>
        <mesh ref={rightWingRef} position={[ 0.76, 0.02, 0.05]} rotation={[0.1,  0.1, -0.25]} scale={[0.22, 0.52, 0.18]}><sphereGeometry args={[1, 18, 18]} /><meshStandardMaterial color={PG_BODY} roughness={0.72} metalness={0.08} /></mesh>
        {/* Left foot */}
        <mesh position={[-0.20, -0.74, 0.12]} rotation={[0.30, 0, 0]} scale={[0.20, 0.08, 0.32]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} metalness={0.08} /></mesh>
        <mesh position={[-0.12, -0.75, 0.28]} rotation={[0.2, -0.25, 0]} scale={[0.07, 0.05, 0.20]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
        <mesh position={[-0.20, -0.75, 0.30]} rotation={[0.2,  0.00, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
        <mesh position={[-0.28, -0.75, 0.28]} rotation={[0.2,  0.25, 0]} scale={[0.07, 0.05, 0.20]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
        {/* Right foot */}
        <mesh position={[0.20, -0.74, 0.12]} rotation={[0.30, 0, 0]} scale={[0.20, 0.08, 0.32]}><sphereGeometry args={[1, 10, 10]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} metalness={0.08} /></mesh>
        <mesh position={[0.28, -0.75, 0.28]} rotation={[0.2,  0.25, 0]} scale={[0.07, 0.05, 0.20]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
        <mesh position={[0.20, -0.75, 0.30]} rotation={[0.2,  0.00, 0]} scale={[0.07, 0.05, 0.22]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
        <mesh position={[0.12, -0.75, 0.28]} rotation={[0.2, -0.25, 0]} scale={[0.07, 0.05, 0.20]}><sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={PG_ORANGE} roughness={0.45} /></mesh>
      </group>
    </group>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Canvas wrapper — exported component
// ════════════════════════════════════════════════════════════════════════════

interface PoopCharacter3DProps {
  appState: AppState;
  volume: number;
  mouthOpen: number;
  character: CharacterType;
}

const GLOW_COLORS: Record<CharacterType, string> = {
  chick:   'rgba(255,217,61,0.22)',
  poop:    'rgba(160,90,30,0.22)',
  penguin: 'rgba(120,160,255,0.22)',
};
const GLOW_IDLE: Record<CharacterType, string> = {
  chick:   'rgba(255,217,61,0.06)',
  poop:    'rgba(160,90,30,0.06)',
  penguin: 'rgba(120,160,255,0.06)',
};

export function PoopCharacter3D({ appState, volume, mouthOpen, character }: PoopCharacter3DProps) {
  const isActive = appState === 'listening' || appState === 'playback';
  const glowColor = isActive ? GLOW_COLORS[character] : GLOW_IDLE[character];

  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className={`rounded-full transition-all duration-700 ${isActive ? 'glow-pulse' : ''}`}
          style={{
            width: '280px',
            height: '280px',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 4.2], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 5]} intensity={0.85} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.22} color="#88AACC" />
        <pointLight position={[0, 3, 2.5]} intensity={0.5} color="#FFE080" />

        <Suspense fallback={null}>
          <CharacterSwitch isActive={character === 'chick'}>
            <ChickMesh appState={appState} volume={volume} mouthOpen={mouthOpen} />
          </CharacterSwitch>
          <CharacterSwitch isActive={character === 'poop'}>
            <PoopMesh appState={appState} volume={volume} mouthOpen={mouthOpen} />
          </CharacterSwitch>
          <CharacterSwitch isActive={character === 'penguin'}>
            <PenguinMesh appState={appState} volume={volume} mouthOpen={mouthOpen} />
          </CharacterSwitch>
          <ContactShadows position={[0, -1.6, 0]} opacity={0.28} scale={4} blur={2.5} far={3} />
        </Suspense>
      </Canvas>
    </div>
  );
}
