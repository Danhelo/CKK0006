"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ArmModel } from "@/components/arm-3d/arm-model";
import { LightingRig } from "@/components/arm-3d/lighting";
import { RibbonTrail } from "@/components/arm-3d/ribbon-trail";
import { DivergenceHotspots } from "@/components/arm-3d/divergence-hotspots";
import { Ground } from "@/components/arm-3d/ground";
import type { Angles } from "@/lib/types";

// ── Trail data ──

// Designed path — smooth, clean arc (teal)
const DESIGNED_PATH: [number, number, number][] = [
  [0, 0.5, 0],
  [0.2, 0.8, 0.1],
  [0.5, 1.2, 0.2],
  [0.8, 1.5, 0.15],
  [1.0, 1.7, 0.1],
  [1.2, 1.8, 0],
  [1.3, 1.75, -0.1],
  [1.2, 1.6, -0.2],
  [1.0, 1.3, -0.15],
  [0.7, 1.0, -0.1],
  [0.4, 0.7, 0],
  [0.1, 0.5, 0.05],
];

// Actual path — diverges from designed (amber)
const ACTUAL_PATH: [number, number, number][] = [
  [0, 0.5, 0],
  [0.25, 0.75, 0.15],
  [0.55, 1.1, 0.35],
  [0.85, 1.35, 0.3],
  [1.1, 1.55, 0.25],
  [1.25, 1.7, 0.15],
  [1.35, 1.65, -0.05],
  [1.15, 1.45, -0.25],
  [0.95, 1.15, -0.3],
  [0.65, 0.85, -0.2],
  [0.35, 0.6, -0.05],
  [0.1, 0.45, 0.1],
];

// ── Arm poses it cycles through (roughly traces the actual path) ──
const ARM_POSES: Angles[] = [
  [90, 75, 125, 90], // Start: neutral
  [110, 55, 140, 70], // Reaching out
  [130, 40, 155, 50], // Full extension
  [100, 60, 130, 80], // Return sweep
];

const POSE_DURATION_MS = 3000;

interface ConceptComparisonProps {
  isVisible: boolean;
}

function ComparisonScene() {
  const [poseIndex, setPoseIndex] = useState(0);

  const cyclePose = useCallback(() => {
    setPoseIndex((prev) => (prev + 1) % ARM_POSES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(cyclePose, POSE_DURATION_MS);
    return () => clearInterval(interval);
  }, [cyclePose]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.5, 2.5, 3.5]} fov={40} />

      <LightingRig detail="low" />

      <ArmModel angles={ARM_POSES[poseIndex]} detail="low" />

      <Ground detail="low" />

      {/* Designed path — teal, thinner, translucent */}
      <RibbonTrail
        points={DESIGNED_PATH}
        color="#5EEAD4"
        width={0.018}
        opacity={0.5}
        emissiveIntensity={0.8}
      />

      {/* Actual path — amber, thicker, prominent */}
      <RibbonTrail
        points={ACTUAL_PATH}
        color="#F5A623"
        width={0.03}
        opacity={0.9}
        emissiveIntensity={1.2}
      />

      {/* Pulsing hotspots where paths diverge */}
      <DivergenceHotspots
        actualPath={ACTUAL_PATH}
        designedPath={DESIGNED_PATH}
        threshold={0.12}
      />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.8}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[0.5, 1.0, 0]}
      />
    </>
  );
}

export function ConceptComparison({ isVisible }: ConceptComparisonProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Single 3D scene — arm + both trails overlaid */}
      <div
        className="h-[340px] w-full overflow-hidden rounded-lg"
        style={{ border: "1px solid var(--border)" }}
      >
        {isVisible && (
          <Canvas
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor("#0C0C0C");
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.3;
            }}
          >
            <Suspense fallback={null}>
              <ComparisonScene />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-5 rounded-full"
            style={{ background: "#5EEAD4", opacity: 0.7 }}
          />
          <span
            className="text-[10px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Designed path
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-5 rounded-full"
            style={{ background: "#F5A623" }}
          />
          <span
            className="text-[10px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Actual path
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: "#F5A623", opacity: 0.6 }}
          />
          <span
            className="text-[10px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Divergence
          </span>
        </div>
      </div>
    </div>
  );
}
