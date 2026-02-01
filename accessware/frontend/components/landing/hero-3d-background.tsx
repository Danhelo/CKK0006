"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import type { Angles } from "@/lib/types";
import { SERVO_REST } from "@/lib/constants";
import { ArmModel } from "@/components/arm-3d/arm-model";
import { LightingRig } from "@/components/arm-3d/lighting";
import { JoystickModel } from "@/components/arm-3d/parts/joystick-model";
import { DirectionTestEffect } from "@/components/arm-3d/direction-test-effect";
import { useJoystickChoreography } from "@/components/arm-3d/use-joystick-choreography";
import { JOYSTICK_POSITION } from "@/components/arm-3d/joystick-test-choreography";

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
function HeroScene() {
  const choreography = useJoystickChoreography(true, 0.85);

  // Shared ref: ArmModel writes spring angles, JoystickModel reads them for tilt
  const springAnglesRef = useRef<Angles>([...SERVO_REST]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[4.5, 3.5, 4.5]} fov={35} />

      <SceneFog />

      <LightingRig detail="low" />

      <ArmModel
        angles={choreography.armAngles}
        detail="low"
        springAnglesRef={springAnglesRef}
      />

      <JoystickModel
        position={JOYSTICK_POSITION}
        detail="low"
        springAnglesRef={springAnglesRef}
        glowIntensity={choreography.joystickGlow}
      />
      <DirectionTestEffect
        effect={choreography.activeEffect}
        position={JOYSTICK_POSITION}
        detail="low"
      />

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
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
