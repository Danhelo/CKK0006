"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { JOINT_EMISSIVE } from "./materials";

interface DivergenceHotspotsProps {
  actualPath: [number, number, number][];
  designedPath: [number, number, number][];
  threshold?: number;
}

interface Hotspot {
  position: THREE.Vector3;
  distance: number;
}

export function DivergenceHotspots({
  actualPath,
  designedPath,
  threshold = 0.15,
}: DivergenceHotspotsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const hotspots = useMemo<Hotspot[]>(() => {
    const result: Hotspot[] = [];
    const minLen = Math.min(actualPath.length, designedPath.length);

    for (let i = 0; i < minLen; i++) {
      const a = actualPath[i];
      const d = designedPath[i];
      const dx = a[0] - d[0];
      const dy = a[1] - d[1];
      const dz = a[2] - d[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > threshold) {
        // Place hotspot at midpoint between actual and designed
        result.push({
          position: new THREE.Vector3(
            (a[0] + d[0]) / 2,
            (a[1] + d[1]) / 2,
            (a[2] + d[2]) / 2,
          ),
          distance: dist,
        });
      }
    }
    return result;
  }, [actualPath, designedPath, threshold]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const pulse = 1 + 0.3 * Math.sin(t * 3 + i * 0.7);
      child.scale.setScalar(pulse);
    });
  });

  if (hotspots.length === 0) return null;

  return (
    <group ref={groupRef}>
      {hotspots.map((hs, i) => (
        <mesh key={i} position={hs.position}>
          <sphereGeometry args={[0.03 + hs.distance * 0.02, 12, 12]} />
          <meshStandardMaterial
            color={JOINT_EMISSIVE.color}
            emissive={JOINT_EMISSIVE.emissive}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
            roughness={JOINT_EMISSIVE.roughness}
            metalness={JOINT_EMISSIVE.metalness}
          />
        </mesh>
      ))}
    </group>
  );
}
