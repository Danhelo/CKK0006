"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";

interface RibbonTrailProps {
  points: [number, number, number][];
  color: string;
  width?: number;
  opacity?: number;
  emissiveIntensity?: number;
}

const MAX_POINTS = 200;

export function RibbonTrail({
  points,
  color,
  width = 0.025,
  opacity = 0.85,
  emissiveIntensity = 0.4,
}: RibbonTrailProps) {
  if (points.length < 2) return null;

  const capped = points.length > MAX_POINTS ? points.slice(-MAX_POINTS) : points;

  const curve = useMemo(() => {
    const vectors = capped.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(vectors, false, "centripetal", 0.5);
  }, [capped]);

  const tubularSegments = Math.min(capped.length * 2, 200);

  return (
    <mesh>
      <tubeGeometry args={[curve, tubularSegments, width, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={opacity}
        roughness={0.3}
        metalness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
