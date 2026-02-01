"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Angles } from "@/lib/types";
import {
  METAL_MID,
  HORN_CREAM,
  BRACKET_DARK,
  JOINT_EMISSIVE,
  EDGE_HIGHLIGHT,
  JOYSTICK_BASE,
  JOYSTICK_ACTIVE_RING,
} from "../materials";
import { stepSpring, SMOOTH_SPRING, type SpringState } from "../animation";
import type { DetailLevel } from "../types";

// Center grip position — the arm angles when holding the joystick upright.
// FK at [90, 143, 25, 45] places gripper tip at ≈ [-2.5, 0.46, 0].
const GRIP_CENTER_S1 = 90;  // base rotation
const GRIP_CENTER_S2 = 143; // shoulder angle

// Grip detection thresholds (servo4 angle)
const GRIP_OPEN = 70;  // above this → not gripping
const GRIP_FULL = 50;  // below this → fully coupled

// Tilt scale: degrees of arm deviation → tilt magnitude.
// The arm extends along -X. Shoulder (s2) deviation pushes the gripper
// further/closer in -X → maps to joystick rotation.z (lean in XY plane).
// Base (s1) deviation sweeps the gripper in ±Z → maps to rotation.x (lean in YZ plane).
// Choreography moves each axis ±3° for ±0.8 tilt → 0.267/degree.
const TILT_SCALE = 0.267;

interface JoystickModelProps {
  position: [number, number, number];
  detail: DetailLevel;
  /** Shared ref written by ArmModel each frame — drives tilt mechanically. */
  springAnglesRef?: React.MutableRefObject<Angles>;
  glowIntensity?: number;
}

export function JoystickModel({
  position,
  detail,
  springAnglesRef,
  glowIntensity = 0,
}: JoystickModelProps) {
  const stickRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowSpring = useRef<SpringState>({ position: 0, velocity: 0 });

  useFrame((_, delta) => {
    // Derive tilt from the arm's actual spring-interpolated position.
    // The arm extends along -X, so:
    //   shoulder (s2) deviation → forward/back in -X → rotation.z (lean in XY)
    //   base (s1) deviation → sweep in ±Z → rotation.x (lean in YZ)
    let tiltX = 0; // drives rotation.z (forward/back lean)
    let tiltZ = 0; // drives rotation.x (left/right lean)

    if (springAnglesRef) {
      const [s1, s2, , s4] = springAnglesRef.current;

      // Coupling factor: 0 when not gripping, 1 when fully gripping
      const gripFactor = Math.max(0, Math.min(1, (GRIP_OPEN - s4) / (GRIP_OPEN - GRIP_FULL)));

      // Shoulder deviation → forward/back lean (rotation.z)
      const rawTiltX = -(s2 - GRIP_CENTER_S2) * TILT_SCALE;
      // Base rotation deviation → left/right lean (rotation.x)
      const rawTiltZ = (s1 - GRIP_CENTER_S1) * TILT_SCALE;

      tiltX = rawTiltX * gripFactor;
      tiltZ = rawTiltZ * gripFactor;
    }

    if (stickRef.current) {
      stickRef.current.rotation.z = -tiltX * 0.436;
      stickRef.current.rotation.x = tiltZ * 0.436;
    }

    // Spring-smooth glow only
    glowSpring.current = stepSpring(glowSpring.current, glowIntensity, SMOOTH_SPRING, delta);
    const smoothGlow = glowSpring.current.position;

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = smoothGlow;
      mat.opacity = 0.3 + smoothGlow * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Mounting plate */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
        <meshStandardMaterial {...BRACKET_DARK} />
      </mesh>

      {/* Base housing — squat cylinder */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.12, 24]} />
        <meshStandardMaterial {...JOYSTICK_BASE} />
      </mesh>

      {/* Accent ring at base top edge */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.008, 8, 24]} />
        <meshStandardMaterial
          color={JOINT_EMISSIVE.color}
          emissive={JOINT_EMISSIVE.emissive}
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Pivot sphere at base top */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial
          color={JOINT_EMISSIVE.color}
          emissive={JOINT_EMISSIVE.emissive}
          emissiveIntensity={0.4}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Stick group — tilts driven by arm spring angles */}
      <group ref={stickRef} position={[0, 0.16, 0]}>
        {/* Shaft */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.018, 0.022, 0.24, 12]} />
          <meshStandardMaterial {...METAL_MID} />
        </mesh>
        {/* Knob */}
        <mesh position={[0, 0.27, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial {...HORN_CREAM} />
        </mesh>
      </group>

      {/* Glow ring around base */}
      <mesh ref={glowRef} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 8, 24]} />
        <meshStandardMaterial
          {...JOYSTICK_ACTIVE_RING}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Direction arrows — high detail only */}
      {detail === "high" && (
        <>
          <DirectionChevron position={[0, 0.02, -0.26]} rotation={[0, 0, 0]} />
          <DirectionChevron position={[0, 0.02, 0.26]} rotation={[0, Math.PI, 0]} />
          <DirectionChevron position={[-0.26, 0.02, 0]} rotation={[0, Math.PI / 2, 0]} />
          <DirectionChevron position={[0.26, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </>
      )}
    </group>
  );
}

function DirectionChevron({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[0.025, 0.05, 3]} />
      <meshStandardMaterial {...EDGE_HIGHLIGHT} />
    </mesh>
  );
}
