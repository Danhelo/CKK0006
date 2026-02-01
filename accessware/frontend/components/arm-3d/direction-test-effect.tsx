"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DetailLevel } from "./types";

interface DirectionTestEffectProps {
  effect: string | null;
  position: [number, number, number];
  detail: DetailLevel;
}

// The arm extends along -X, so directions are:
//   up (forward)  = further -X
//   down (back)   = toward +X
//   left           = -Z
//   right          = +Z
const DIRECTION_OFFSETS: Record<string, [number, number, number]> = {
  "pulse-up":    [-0.3, 0, 0],
  "pulse-down":  [0.3, 0, 0],
  "pulse-left":  [0, 0, -0.3],
  "pulse-right": [0, 0, 0.3],
};

const CHECK_COLOR = new THREE.Color("#7ED321");
const AMBER_COLOR = new THREE.Color("#F5A623");

export function DirectionTestEffect({ effect, position, detail }: DirectionTestEffectProps) {
  const chevronRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(0);
  const activeEffectRef = useRef<string | null>(null);

  useEffect(() => {
    activeEffectRef.current = effect;
    startTimeRef.current = 0;
  }, [effect]);

  useFrame(({ clock }) => {
    const now = clock.getElapsedTime();

    if (startTimeRef.current === 0 && activeEffectRef.current) {
      startTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current;
    const eff = activeEffectRef.current;

    // Direction pulse chevron
    if (chevronRef.current) {
      const isDirection = eff && eff.startsWith("pulse-");
      if (isDirection && detail === "high") {
        const dir = DIRECTION_OFFSETS[eff!];
        const t = Math.min(elapsed / 1.0, 1);
        chevronRef.current.visible = true;
        chevronRef.current.position.set(
          position[0] + dir[0] * t,
          position[1] + 0.3,
          position[2] + dir[2] * t,
        );
        const mat = chevronRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
      } else {
        chevronRef.current.visible = false;
      }
    }

    // Check ring (expanding torus)
    if (ringRef.current) {
      const isCheck = eff === "check";
      if (isCheck) {
        const t = Math.min(elapsed / 0.6, 1);
        ringRef.current.visible = true;
        ringRef.current.position.set(position[0], position[1] + 0.2, position[2]);
        const scale = 0.05 + (0.3 - 0.05) * t;
        ringRef.current.scale.setScalar(scale / 0.15);
        const mat = ringRef.current.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.6 * (1 - t);
      } else {
        ringRef.current.visible = false;
      }
    }
  });

  return (
    <>
      {/* Direction chevron */}
      {detail === "high" && (
        <mesh ref={chevronRef} visible={false}>
          <coneGeometry args={[0.04, 0.08, 4]} />
          <meshStandardMaterial
            color={AMBER_COLOR}
            emissive={AMBER_COLOR}
            emissiveIntensity={0.8}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Check ring */}
      <mesh ref={ringRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.01, 8, 24]} />
        <meshStandardMaterial
          color={CHECK_COLOR}
          emissive={CHECK_COLOR}
          emissiveIntensity={0.6}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
