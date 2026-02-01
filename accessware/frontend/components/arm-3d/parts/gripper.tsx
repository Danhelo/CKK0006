import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { METAL_DARK, METAL_MID, METAL_LIGHT } from "../materials";
import { ServoBody } from "./servo-body";
import type { DetailLevel } from "../types";

interface GripperProps {
  detail: DetailLevel;
  /** Ref to finger spread value, updated per frame from arm-model */
  fingerSpreadRef: React.MutableRefObject<number>;
}

/**
 * Gripper assembly with named refs for finger control.
 * Reads fingerSpreadRef per frame for smooth animation.
 */
export function Gripper({ detail, fingerSpreadRef }: GripperProps) {
  const leftFingerRef = useRef<THREE.Mesh>(null);
  const rightFingerRef = useRef<THREE.Mesh>(null);
  const leftPadRef = useRef<THREE.Mesh>(null);
  const rightPadRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const spread = fingerSpreadRef.current;
    if (leftFingerRef.current) {
      leftFingerRef.current.position.x = 0.06 + spread;
    }
    if (rightFingerRef.current) {
      rightFingerRef.current.position.x = -(0.06 + spread);
    }
    if (leftPadRef.current) {
      leftPadRef.current.position.x = 0.06 + spread;
    }
    if (rightPadRef.current) {
      rightPadRef.current.position.x = -(0.06 + spread);
    }
  });

  return (
    <group>
      {/* Horizontal servo body */}
      <ServoBody
        detail={detail}
        position={[0, 0.02, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />

      {/* Bridge bar */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.06]} />
        <meshStandardMaterial {...METAL_MID} />
      </mesh>

      {/* Left finger */}
      <mesh ref={leftFingerRef} position={[0.06, 0.15, 0]}>
        <boxGeometry args={[0.03, 0.25, 0.06]} />
        <meshStandardMaterial {...METAL_LIGHT} />
      </mesh>

      {/* Right finger */}
      <mesh ref={rightFingerRef} position={[-0.06, 0.15, 0]}>
        <boxGeometry args={[0.03, 0.25, 0.06]} />
        <meshStandardMaterial {...METAL_LIGHT} />
      </mesh>

      {/* Grip pads (rubber-like) near fingertips — track finger positions */}
      <mesh ref={leftPadRef} position={[0.06, 0.24, 0]}>
        <boxGeometry args={[0.015, 0.06, 0.065]} />
        <meshStandardMaterial color="#1A1A1A" roughness={1} metalness={0.1} />
      </mesh>
      <mesh ref={rightPadRef} position={[-0.06, 0.24, 0]}>
        <boxGeometry args={[0.015, 0.06, 0.065]} />
        <meshStandardMaterial color="#1A1A1A" roughness={1} metalness={0.1} />
      </mesh>

      {/* Decorative linkage bars — high detail only */}
      {detail === "high" && (
        <>
          <mesh position={[0.04, 0.08, 0.035]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.008, 0.1, 0.008]} />
            <meshStandardMaterial {...METAL_DARK} />
          </mesh>
          <mesh position={[-0.04, 0.08, 0.035]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.008, 0.1, 0.008]} />
            <meshStandardMaterial {...METAL_DARK} />
          </mesh>
        </>
      )}
    </group>
  );
}
