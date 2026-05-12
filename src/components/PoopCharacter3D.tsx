import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AppState } from '../utils/types';
import { useBlinkAnimation } from '../hooks/useBlinkAnimation';

const YELLOW       = '#FFD93D';
const YELLOW_DARK  = '#F5B800';
const YELLOW_LIGHT = '#FFF5A8';
const ORANGE       = '#FF8C00';
const BEAK_COLOR   = '#FF7700';
const EYE_DARK     = '#120A02';
const EYE_WHITE    = '#FAFAFA';

interface ChickMeshProps {
  appState: AppState;
  volume: number;
  mouthOpen: number;
}

function ChickMesh({ appState, volume, mouthOpen }: ChickMeshProps) {
  const rootRef      = useRef<THREE.Group>(null);
  const bodyRef      = useRef<THREE.Group>(null);
  const leftEyeRef   = useRef<THREE.Mesh>(null);
  const rightEyeRef  = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef= useRef<THREE.Mesh>(null);
  const leftWingRef  = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const beakLowerRef = useRef<THREE.Mesh>(null);
  const tailGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  const isBlinking = useBlinkAnimation();
  const isSpeaking = appState === 'listening' || appState === 'playback';

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!rootRef.current) return;

    // Cute bouncy float
    rootRef.current.position.y = Math.sin(t * 1.3) * 0.09;
    rootRef.current.rotation.y = Math.sin(t * 0.55) * 0.08;

    // Breathing + speaking bounce
    const breathe    = 1 + Math.sin(t * 1.9) * 0.016;
    const speakScale = isSpeaking ? 1 + volume * 0.055 : 1;
    rootRef.current.scale.setScalar(breathe * speakScale);

    // Body squash-stretch
    if (bodyRef.current) {
      const sqY = isSpeaking ? Math.max(0.93, 1 - volume * 0.055) : 1;
      const sqX = isSpeaking ? 1 + (1 - sqY) * 0.5 : 1;
      bodyRef.current.scale.y = THREE.MathUtils.lerp(bodyRef.current.scale.y, sqY, 0.15);
      bodyRef.current.scale.x = THREE.MathUtils.lerp(bodyRef.current.scale.x, sqX, 0.15);
    }

    // Blink
    const blinkTarget = isBlinking ? 0.05 : 1.0;
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkTarget, 0.38);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkTarget, 0.38);
    }

    // Pupil wander when listening
    if (leftPupilRef.current && rightPupilRef.current) {
      const px = appState === 'listening' ? Math.sin(t * 2.3) * 0.026 : 0;
      const py = appState === 'listening' ? Math.cos(t * 1.9) * 0.016 : 0;
      leftPupilRef.current.position.x  = THREE.MathUtils.lerp(leftPupilRef.current.position.x,  -0.23 + px, 0.12);
      leftPupilRef.current.position.y  = THREE.MathUtils.lerp(leftPupilRef.current.position.y,   0.90 + py, 0.12);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x,  0.23 + px, 0.12);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y,  0.90 + py, 0.12);
    }

    // Wing flap — gentle idle, frantic when speaking
    const idleFlap  = Math.sin(t * 2.2) * 0.18;
    const speakFlap = isSpeaking ? Math.sin(t * 7.0) * 0.38 * volume : 0;
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = THREE.MathUtils.lerp(
        leftWingRef.current.rotation.z,
        0.55 + idleFlap + speakFlap,
        0.12
      );
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = THREE.MathUtils.lerp(
        rightWingRef.current.rotation.z,
        -0.55 - idleFlap - speakFlap,
        0.12
      );
    }

    // Tail wag
    if (tailGroupRef.current) {
      const wag = isSpeaking
        ? Math.sin(t * 8.0) * 0.14 * volume
        : Math.sin(t * 1.5) * 0.04;
      tailGroupRef.current.rotation.z = THREE.MathUtils.lerp(tailGroupRef.current.rotation.z, wag, 0.14);
    }

    // Beak opens for lip-sync (lower jaw drops)
    if (beakLowerRef.current) {
      const targetY = isSpeaking ? 0.79 - mouthOpen * 0.18 : 0.79;
      beakLowerRef.current.position.y = THREE.MathUtils.lerp(beakLowerRef.current.position.y, targetY, 0.25);
    }

    // Warm glow during activity
    if (glowLightRef.current) {
      const targetI = appState === 'listening'
        ? 2.5 + volume * 5
        : appState === 'playback'
        ? 1.8 + volume * 4
        : 0.2;
      glowLightRef.current.intensity = THREE.MathUtils.lerp(glowLightRef.current.intensity, targetI, 0.1);
    }
  });

  return (
    <group ref={rootRef}>
      <pointLight ref={glowLightRef} color="#FFE680" intensity={0.2} distance={4} decay={2} />

      <group ref={bodyRef}>

        {/* ══════════ BODY ══════════ */}
        <mesh position={[0, -0.08, 0]} scale={[1, 0.91, 1]}>
          <sphereGeometry args={[0.72, 32, 32]} />
          <meshStandardMaterial color={YELLOW} roughness={0.72} />
        </mesh>

        {/* Soft tummy patch */}
        <mesh position={[0, -0.16, 0.56]} scale={[0.68, 0.80, 0.34]}>
          <sphereGeometry args={[0.72, 24, 24]} />
          <meshStandardMaterial color={YELLOW_LIGHT} roughness={0.9} transparent opacity={0.6} />
        </mesh>

        {/* ══════════ HEAD ══════════ */}
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.52, 32, 32]} />
          <meshStandardMaterial color={YELLOW} roughness={0.68} />
        </mesh>

        {/* Head-body connection fluff */}
        <mesh position={[0, 0.38, 0]} scale={[0.88, 0.44, 0.82]}>
          <sphereGeometry args={[0.58, 20, 20]} />
          <meshStandardMaterial color={YELLOW} roughness={0.75} />
        </mesh>

        {/* ══════════ TUFT ══════════ */}
        <mesh position={[ 0.04, 1.38,  0.04]} scale={[0.20, 0.32, 0.18]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={YELLOW_DARK} roughness={0.82} />
        </mesh>
        <mesh position={[-0.09, 1.35,  0.02]} scale={[0.17, 0.28, 0.15]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={YELLOW} roughness={0.82} />
        </mesh>
        <mesh position={[ 0.12, 1.32,  0.00]} scale={[0.14, 0.23, 0.12]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={YELLOW_DARK} roughness={0.82} />
        </mesh>

        {/* ══════════ BEAK ══════════ */}
        {/* Upper beak — fixed */}
        <mesh position={[0, 0.86, 0.51]} scale={[0.23, 0.11, 0.27]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={BEAK_COLOR} roughness={0.40} metalness={0.06} />
        </mesh>
        {/* Lower beak — drops for lip-sync */}
        <mesh ref={beakLowerRef} position={[0, 0.79, 0.51]} scale={[0.20, 0.09, 0.23]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color={ORANGE} roughness={0.40} metalness={0.06} />
        </mesh>

        {/* ══════════ EYES ══════════ */}
        {/* Left eye white */}
        <mesh ref={leftEyeRef} position={[-0.23, 0.90, 0.44]}>
          <sphereGeometry args={[0.105, 20, 20]} />
          <meshStandardMaterial color={EYE_WHITE} roughness={0.08} />
        </mesh>
        {/* Left pupil */}
        <mesh ref={leftPupilRef} position={[-0.23, 0.90, 0.535]}>
          <sphereGeometry args={[0.050, 14, 14]} />
          <meshStandardMaterial color={EYE_DARK} roughness={0.9} />
        </mesh>
        {/* Left catchlight */}
        <mesh position={[-0.212, 0.926, 0.542]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} roughness={0.0} />
        </mesh>
        {/* Left cheek blush */}
        <mesh position={[-0.38, 0.76, 0.36]} scale={[0.13, 0.08, 0.055]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#FF9999" roughness={1} transparent opacity={0.38} />
        </mesh>

        {/* Right eye white */}
        <mesh ref={rightEyeRef} position={[0.23, 0.90, 0.44]}>
          <sphereGeometry args={[0.105, 20, 20]} />
          <meshStandardMaterial color={EYE_WHITE} roughness={0.08} />
        </mesh>
        {/* Right pupil */}
        <mesh ref={rightPupilRef} position={[0.23, 0.90, 0.535]}>
          <sphereGeometry args={[0.050, 14, 14]} />
          <meshStandardMaterial color={EYE_DARK} roughness={0.9} />
        </mesh>
        {/* Right catchlight */}
        <mesh position={[0.248, 0.926, 0.542]}>
          <sphereGeometry args={[0.017, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} roughness={0.0} />
        </mesh>
        {/* Right cheek blush */}
        <mesh position={[0.38, 0.76, 0.36]} scale={[0.13, 0.08, 0.055]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#FF9999" roughness={1} transparent opacity={0.38} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.23, 1.020, 0.41]} rotation={[0.10, 0, 0.28]}>
          <boxGeometry args={[0.12, 0.022, 0.022]} />
          <meshStandardMaterial color="#D4A000" roughness={0.8} />
        </mesh>
        <mesh position={[ 0.23, 1.020, 0.41]} rotation={[0.10, 0, -0.28]}>
          <boxGeometry args={[0.12, 0.022, 0.022]} />
          <meshStandardMaterial color="#D4A000" roughness={0.8} />
        </mesh>

        {/* ══════════ WINGS ══════════ */}
        <mesh ref={leftWingRef} position={[-0.80, -0.04, 0.0]} rotation={[0.14, -0.05, 0.55]} scale={[0.54, 0.42, 0.28]}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshStandardMaterial color={YELLOW_DARK} roughness={0.65} />
        </mesh>
        <mesh ref={rightWingRef} position={[0.80, -0.04, 0.0]} rotation={[0.14, 0.05, -0.55]} scale={[0.54, 0.42, 0.28]}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshStandardMaterial color={YELLOW_DARK} roughness={0.65} />
        </mesh>

        {/* ══════════ TAIL ══════════ */}
        <group ref={tailGroupRef} position={[0, 0.12, -0.72]}>
          <mesh rotation={[-0.55, 0, 0]} scale={[0.36, 0.54, 0.22]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={YELLOW_DARK} roughness={0.72} />
          </mesh>
          <mesh position={[ 0.08, 0.18, -0.08]} rotation={[-0.62, 0,  0.08]} scale={[0.18, 0.42, 0.15]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color={YELLOW} roughness={0.72} />
          </mesh>
          <mesh position={[-0.09, 0.16, -0.07]} rotation={[-0.58, 0, -0.08]} scale={[0.16, 0.38, 0.13]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color={YELLOW} roughness={0.72} />
          </mesh>
        </group>

        {/* ══════════ LEGS ══════════ */}
        <mesh position={[-0.22, -0.76, 0.05]}>
          <cylinderGeometry args={[0.045, 0.038, 0.28, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.48} metalness={0.06} />
        </mesh>
        <mesh position={[ 0.22, -0.76, 0.05]}>
          <cylinderGeometry args={[0.045, 0.038, 0.28, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.48} metalness={0.06} />
        </mesh>

        {/* ══════════ FEET ══════════ */}
        {/* Left foot pad */}
        <mesh position={[-0.22, -0.92, 0.16]} rotation={[0.28, 0, 0]} scale={[0.22, 0.09, 0.34]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={ORANGE} roughness={0.48} metalness={0.06} />
        </mesh>
        {/* Left toes */}
        <mesh position={[-0.14, -0.93, 0.30]} rotation={[0.20, -0.28, 0]} scale={[0.07, 0.05, 0.22]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[-0.22, -0.93, 0.32]} rotation={[0.20,  0.00, 0]} scale={[0.07, 0.05, 0.24]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[-0.30, -0.93, 0.29]} rotation={[0.20,  0.28, 0]} scale={[0.07, 0.05, 0.22]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>

        {/* Right foot pad */}
        <mesh position={[0.22, -0.92, 0.16]} rotation={[0.28, 0, 0]} scale={[0.22, 0.09, 0.34]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color={ORANGE} roughness={0.48} metalness={0.06} />
        </mesh>
        {/* Right toes */}
        <mesh position={[0.30, -0.93, 0.30]} rotation={[0.20,  0.28, 0]} scale={[0.07, 0.05, 0.22]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[0.22, -0.93, 0.32]} rotation={[0.20,  0.00, 0]} scale={[0.07, 0.05, 0.24]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
        <mesh position={[0.14, -0.93, 0.29]} rotation={[0.20, -0.28, 0]} scale={[0.07, 0.05, 0.22]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
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
      {/* Warm glow ring */}
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
              ? 'radial-gradient(circle, rgba(255,217,61,0.22) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,217,61,0.06) 0%, transparent 70%)',
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
          <ChickMesh appState={appState} volume={volume} mouthOpen={mouthOpen} />
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.28}
            scale={4}
            blur={2.5}
            far={3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
