"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { Angles } from "@/lib/types";
import { ARM_DIMENSIONS, SERVO_REST } from "@/lib/constants";

interface Arm3DProps {
  angles?: Angles;
  actualTrail?: [number, number, number][];
  designedTrail?: [number, number, number][];
  showDesigned?: boolean;
  autoRotate?: boolean;
}

// ── Materials ──
const METAL_DARK = { color: "#2A2A2A", roughness: 0.7, metalness: 0.8 };
const METAL_MID = { color: "#3A3A3A", roughness: 0.65, metalness: 0.85 };
const METAL_LIGHT = { color: "#4A4A4A", roughness: 0.6, metalness: 0.8 };
const JOINT_EMISSIVE = { color: "#F5A623", emissive: "#F5A623", emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.9 };

function lerpAngle(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

function JointSphere({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[ARM_DIMENSIONS.jointRadius, 16, 16]} />
      <meshStandardMaterial {...JOINT_EMISSIVE} />
    </mesh>
  );
}

function GripperFinger({ side }: { side: 1 | -1 }) {
  return (
    <mesh position={[side * 0.06, 0.15, 0]}>
      <boxGeometry args={[0.03, 0.25, 0.06]} />
      <meshStandardMaterial {...METAL_LIGHT} />
    </mesh>
  );
}

interface ArmModelProps {
  angles: Angles;
}

function ArmModel({ angles }: ArmModelProps) {
  const { baseHeight, segment1Length, segment2Length } = ARM_DIMENSIONS;
  const baseRef = useRef<THREE.Group>(null);
  const seg1Ref = useRef<THREE.Group>(null);
  const seg2Ref = useRef<THREE.Group>(null);
  const gripRef = useRef<THREE.Group>(null);

  const currentAngles = useRef<Angles>([...SERVO_REST]);

  useFrame(() => {
    const alpha = 0.08;
    currentAngles.current = currentAngles.current.map(
      (c, i) => lerpAngle(c, angles[i], alpha)
    ) as Angles;

    const [s1, s2, s3, s4] = currentAngles.current;

    if (baseRef.current) {
      baseRef.current.rotation.y = ((s1 - 90) * Math.PI) / 180;
    }
    if (seg1Ref.current) {
      seg1Ref.current.rotation.z = ((s2 - 90) * Math.PI) / 180;
    }
    if (seg2Ref.current) {
      seg2Ref.current.rotation.z = (-(s3 - 90) * Math.PI) / 180;
    }
    if (gripRef.current) {
      // Gripper open/close: map 0-180 to finger spread
      const spread = ((s4 - 90) / 180) * 0.12;
      const children = gripRef.current.children;
      if (children.length >= 2) {
        (children[0] as THREE.Mesh).position.x = 0.06 + spread;
        (children[1] as THREE.Mesh).position.x = -(0.06 + spread);
      }
    }
  });

  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, baseHeight / 2, 0]}>
        <cylinderGeometry args={[0.8, 0.9, baseHeight, 32]} />
        <meshStandardMaterial {...METAL_DARK} />
      </mesh>
      {/* Base ring accent */}
      <mesh position={[0, baseHeight, 0]}>
        <torusGeometry args={[0.75, 0.03, 8, 32]} />
        <meshStandardMaterial {...JOINT_EMISSIVE} />
      </mesh>

      {/* Rotation group — Servo 1 */}
      <group ref={baseRef} position={[0, baseHeight, 0]}>
        <JointSphere position={[0, 0, 0]} />

        {/* Segment 1 group — Servo 2 */}
        <group ref={seg1Ref}>
          <mesh position={[0, segment1Length / 2, 0]}>
            <boxGeometry args={[0.2, segment1Length, 0.2]} />
            <meshStandardMaterial {...METAL_MID} />
          </mesh>
          {/* Edge highlights */}
          <mesh position={[0.11, segment1Length / 2, 0]}>
            <boxGeometry args={[0.01, segment1Length, 0.21]} />
            <meshStandardMaterial color="#333" roughness={0.5} metalness={0.9} />
          </mesh>

          {/* Joint between seg1 and seg2 */}
          <group position={[0, segment1Length, 0]}>
            <JointSphere position={[0, 0, 0]} />

            {/* Segment 2 group — Servo 3 */}
            <group ref={seg2Ref}>
              <mesh position={[0, segment2Length / 2, 0]}>
                <boxGeometry args={[0.16, segment2Length, 0.16]} />
                <meshStandardMaterial {...METAL_LIGHT} />
              </mesh>

              {/* Gripper mount */}
              <group position={[0, segment2Length, 0]}>
                <JointSphere position={[0, 0, 0]} />

                {/* Gripper group — Servo 4 */}
                <group ref={gripRef}>
                  <GripperFinger side={1} />
                  <GripperFinger side={-1} />
                  {/* Gripper bridge */}
                  <mesh position={[0, 0.02, 0]}>
                    <boxGeometry args={[0.18, 0.04, 0.06]} />
                    <meshStandardMaterial {...METAL_MID} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#0C0C0C" roughness={1} metalness={0} />
    </mesh>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const pts: [number, number, number][][] = [];
    const size = 5;
    const step = 0.5;
    for (let i = -size; i <= size; i += step) {
      pts.push([
        [i, 0, -size],
        [i, 0, size],
      ]);
      pts.push([
        [-size, 0, i],
        [size, 0, i],
      ]);
    }
    return pts;
  }, []);

  return (
    <>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#F0E6D3"
          opacity={0.04}
          transparent
          lineWidth={0.5}
        />
      ))}
    </>
  );
}

function Trail({
  points,
  color,
  opacity = 0.8,
}: {
  points: [number, number, number][];
  color: string;
  opacity?: number;
}) {
  if (points.length < 2) return null;
  return (
    <Line
      points={points}
      color={color}
      lineWidth={2.5}
      opacity={opacity}
      transparent
    />
  );
}

export function Arm3D({
  angles = SERVO_REST,
  actualTrail = [],
  designedTrail = [],
  showDesigned = true,
  autoRotate = false,
}: Arm3DProps) {
  return (
    <div className="h-full w-full" style={{ background: "#0C0C0C" }}>
      <Canvas
        camera={{ position: [3, 2.5, 3], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0C0C0C");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.8;
        }}
      >
        <ambientLight intensity={0.3} color="#F0E6D3" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.8}
          color="#FFF5E6"
          castShadow
        />
        <pointLight position={[-3, 4, -3]} intensity={0.3} color="#F5A623" />
        <pointLight position={[0, 3, 0]} intensity={0.15} color="#D4883A" />

        <ArmModel angles={angles} />
        <GroundPlane />
        <GridLines />

        {/* Trails */}
        <Trail points={actualTrail} color="#F5A623" opacity={0.85} />
        {showDesigned && (
          <Trail points={designedTrail} color="#4ECDC4" opacity={0.4} />
        )}

        <Environment preset="warehouse" environmentIntensity={0.15} />
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  );
}
