"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import { ArmModel } from "@/components/arm-3d/arm-model";
import { LightingRig } from "@/components/arm-3d/lighting";
import type { Angles } from "@/lib/types";
import { SERVO_REST } from "@/lib/constants";

// ── Dramatic poses the arm cycles through ──
const HERO_POSES: Angles[] = [
  [90, 45, 135, 90], // Full extension
  [135, 60, 120, 40], // Rotated grip
  [45, 70, 110, 90], // Counter-reach
  SERVO_REST, // Rest
];

const POSE_DURATION_MS = 4000;

// ── Fog setup (must be inside Canvas) ──
function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2("#0C0C0C", 0.15);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return null;
}

// ── Inner scene (must be inside Canvas) ──
function HeroScene({ angles }: { angles: Angles }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[4.5, 3.5, 4.5]} fov={35} />

      <SceneFog />

      <LightingRig detail="low" />

      <ArmModel angles={angles} detail="low" />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3}
        target={[0, 1.2, 0]}
      />

      <EffectComposer>
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={7}
        />
        <Vignette darkness={0.4} offset={0.3} />
      </EffectComposer>
    </>
  );
}

// ── Outer component (provides the Canvas) ──
export function Hero3DBackground() {
  const [poseIndex, setPoseIndex] = useState(0);

  const cyclePose = useCallback(() => {
    setPoseIndex((prev) => (prev + 1) % HERO_POSES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(cyclePose, POSE_DURATION_MS);
    return () => clearInterval(interval);
  }, [cyclePose]);

  const currentAngles = HERO_POSES[poseIndex];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0C0C0C");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.3;
        }}
      >
        <Suspense fallback={null}>
          <HeroScene angles={currentAngles} />
        </Suspense>
      </Canvas>
    </div>
  );
}
