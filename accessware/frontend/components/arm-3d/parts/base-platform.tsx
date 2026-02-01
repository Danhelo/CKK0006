import { ARM_DIMENSIONS } from "@/lib/constants";
import { METAL_DARK, JOINT_EMISSIVE, BRACKET_DARK } from "../materials";
import { ServoBody } from "./servo-body";
import type { DetailLevel } from "../types";

interface BasePlatformProps {
  detail: DetailLevel;
}

export function BasePlatform({ detail }: BasePlatformProps) {
  const { baseHeight } = ARM_DIMENSIONS;

  return (
    <group>
      {/* Tapered cylinder */}
      <mesh position={[0, baseHeight / 2, 0]}>
        <cylinderGeometry args={[0.8, 0.9, baseHeight, 32]} />
        <meshStandardMaterial {...METAL_DARK} />
      </mesh>

      {/* Thin accent ring at top edge */}
      <mesh position={[0, baseHeight, 0]}>
        <torusGeometry args={[0.8, 0.01, 8, 32]} />
        <meshStandardMaterial
          color="#F5A623"
          emissive="#F5A623"
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Servo body partially embedded in base */}
      <group position={[0, baseHeight - 0.04, 0]}>
        <ServoBody detail={detail} />
      </group>

      {detail === "high" && (
        <>
          {/* Mounting plate disc at bottom */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 0.03, 32]} />
            <meshStandardMaterial {...BRACKET_DARK} />
          </mesh>

          {/* Decorative ring grooves */}
          <mesh position={[0, baseHeight * 0.3, 0]}>
            <torusGeometry args={[0.86, 0.008, 6, 32]} />
            <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.7} />
          </mesh>
          <mesh position={[0, baseHeight * 0.6, 0]}>
            <torusGeometry args={[0.83, 0.008, 6, 32]} />
            <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
}
