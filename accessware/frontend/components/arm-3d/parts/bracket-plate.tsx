import type { DetailLevel } from "../types";
import { BRACKET_DARK } from "../materials";

interface BracketPlateProps {
  detail: DetailLevel;
  width?: number;
  depth?: number;
  position?: [number, number, number];
}

/**
 * Metal bracket plate with bolt hole indents (high detail).
 */
export function BracketPlate({
  detail,
  width = 0.22,
  depth = 0.18,
  position = [0, 0, 0],
}: BracketPlateProps) {
  const thickness = 0.04;
  const halfW = width / 2 - 0.025;
  const halfD = depth / 2 - 0.025;

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial {...BRACKET_DARK} />
      </mesh>

      {detail === "high" && (
        <>
          {/* Bolt hole indents at corners */}
          {(
            [
              [halfW, halfD],
              [halfW, -halfD],
              [-halfW, halfD],
              [-halfW, -halfD],
            ] as [number, number][]
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, thickness / 2 + 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.005, 8]} />
              <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
            </mesh>
          ))}

          {/* Cross panel lines */}
          <mesh position={[0, thickness / 2 + 0.001, 0]}>
            <boxGeometry args={[width * 0.8, 0.002, 0.003]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[0, thickness / 2 + 0.001, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[depth * 0.8, 0.002, 0.003]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
        </>
      )}
    </group>
  );
}
