"use client";

import { Suspense, Component, useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SERVO_REST } from "@/lib/constants";
import type { Angles } from "@/lib/types";
import { ArmModel } from "./arm-model";
import { LightingRig } from "./lighting";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Ground } from "./ground";
import { Trail } from "./trail";
import { DivergenceHotspots } from "./divergence-hotspots";
import { JoystickModel } from "./parts/joystick-model";
import { DirectionTestEffect } from "./direction-test-effect";
import { JOYSTICK_POSITION } from "./joystick-test-choreography";
import type { Arm3DProps } from "./types";

// ── Error Boundary ──
interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0C0C0C",
            color: "#F0E6D3",
            fontFamily: "monospace",
            fontSize: "13px",
            opacity: 0.6,
          }}
        >
          3D preview unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

export function Arm3D({
  angles = SERVO_REST,
  actualTrail = [],
  designedTrail = [],
  comparisonTrail = [],
  showDesigned = true,
  autoRotate = false,
  detail = "high",
  onJointSelect,
  onJointHover,
  selectedJoint,
  showJoystick = false,
  joystickGlow,
  joystickEffect,
}: Arm3DProps) {
  // Shared ref: ArmModel writes its spring-interpolated angles here each frame,
  // JoystickModel reads them to derive tilt mechanically.
  const springAnglesRef = useRef<Angles>([...SERVO_REST]);

  return (
    <div className="h-full w-full" style={{ background: "#0C0C0C" }}>
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [3, 2.5, 3], fov: 45 }}
          shadows={detail === "high"}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor("#0C0C0C");
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.3;
          }}
        >
          <Suspense fallback={null}>
            <LightingRig detail={detail} />

            <ArmModel
              angles={angles}
              detail={detail}
              onJointSelect={onJointSelect}
              onJointHover={onJointHover}
              selectedJoint={selectedJoint}
              springAnglesRef={showJoystick ? springAnglesRef : undefined}
            />

            {showJoystick && (
              <>
                <JoystickModel
                  position={JOYSTICK_POSITION}
                  detail={detail}
                  springAnglesRef={springAnglesRef}
                  glowIntensity={joystickGlow}
                />
                <DirectionTestEffect
                  effect={joystickEffect ?? null}
                  position={JOYSTICK_POSITION}
                  detail={detail}
                />
              </>
            )}

            <Ground detail={detail} />

            {/* Trails */}
            <Trail points={actualTrail} color="#F5A623" opacity={0.85} width={0.025} />
            {showDesigned && (
              <Trail points={designedTrail} color="#4ECDC4" opacity={0.4} width={0.015} />
            )}
            <Trail points={comparisonTrail} color="#9B59B6" opacity={0.7} />
            {showDesigned && actualTrail.length > 0 && designedTrail.length > 0 && (
              <DivergenceHotspots
                actualPath={actualTrail}
                designedPath={designedTrail}
              />
            )}

            <OrbitControls
              enablePan={false}
              minDistance={2}
              maxDistance={8}
              autoRotate={autoRotate}
              autoRotateSpeed={0.5}
              target={[0, 1.2, 0]}
            />

            {detail === "high" && (
              <EffectComposer>
                <Bloom
                  intensity={0.4}
                  luminanceThreshold={0.6}
                  luminanceSmoothing={0.9}
                />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}

export type { Arm3DProps } from "./types";
