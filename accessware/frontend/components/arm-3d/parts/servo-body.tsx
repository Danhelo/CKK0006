import type { DetailLevel } from "../types";
import { METAL_DARK, HORN_CREAM } from "../materials";

interface ServoBodyProps {
  detail: DetailLevel;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * SG90/MG90S style servo body.
 * Main body: box 0.23 x 0.12 x 0.22
 * High detail adds mounting ears with indent holes and panel line seam.
 */
export function ServoBody({
  detail,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: ServoBodyProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[0.23, 0.12, 0.22]} />
        <meshStandardMaterial {...METAL_DARK} />
      </mesh>

      {/* Output horn — small cylinder on top face */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.025, 0.02, 12]} />
        <meshStandardMaterial {...HORN_CREAM} />
      </mesh>

      {detail === "high" && (
        <>
          {/* Mounting ear — left */}
          <mesh position={[-0.14, 0, 0]}>
            <boxGeometry args={[0.05, 0.025, 0.22]} />
            <meshStandardMaterial {...METAL_DARK} />
          </mesh>
          {/* Mounting ear — right */}
          <mesh position={[0.14, 0, 0]}>
            <boxGeometry args={[0.05, 0.025, 0.22]} />
            <meshStandardMaterial {...METAL_DARK} />
          </mesh>

          {/* Ear holes — left */}
          <mesh position={[-0.14, 0.013, 0.06]}>
            <cylinderGeometry args={[0.012, 0.012, 0.026, 8]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[-0.14, 0.013, -0.06]}>
            <cylinderGeometry args={[0.012, 0.012, 0.026, 8]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
          {/* Ear holes — right */}
          <mesh position={[0.14, 0.013, 0.06]}>
            <cylinderGeometry args={[0.012, 0.012, 0.026, 8]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[0.14, 0.013, -0.06]}>
            <cylinderGeometry args={[0.012, 0.012, 0.026, 8]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>

          {/* Panel line seam (dark inset) */}
          <mesh position={[0, 0, 0.111]}>
            <boxGeometry args={[0.2, 0.08, 0.003]} />
            <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
          </mesh>
        </>
      )}
    </group>
  );
}
