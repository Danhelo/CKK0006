import { useRef } from "react";
import * as THREE from "three";
import { JOINT_EMISSIVE } from "../materials";
import type { DetailLevel } from "../types";

/** Small joint indicator — much smaller than before (radius ~0.04) */
const JOINT_RADIUS = 0.04;

interface JointSphereProps {
  position: [number, number, number];
  detail: DetailLevel;
  jointIndex: number;
  emissiveIntensity?: number;
  scale?: number;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}

export function JointSphere({
  position,
  detail,
  jointIndex,
  emissiveIntensity = 0.35,
  scale = 1,
  onPointerOver,
  onPointerOut,
  onClick,
}: JointSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = detail === "high" ? 12 : 8;
  const isInteractive = detail === "high";

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={isInteractive ? (e) => { e.stopPropagation(); onPointerOver?.(); } : undefined}
        onPointerOut={isInteractive ? (e) => { e.stopPropagation(); onPointerOut?.(); } : undefined}
        onClick={isInteractive ? (e) => { e.stopPropagation(); onClick?.(); } : undefined}
      >
        <sphereGeometry args={[JOINT_RADIUS, segments, segments]} />
        <meshStandardMaterial
          {...JOINT_EMISSIVE}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
}
