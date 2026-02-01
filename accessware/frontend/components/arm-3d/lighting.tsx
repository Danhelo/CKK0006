import { Environment, ContactShadows } from "@react-three/drei";
import type { DetailLevel } from "./types";

interface LightingRigProps {
  detail: DetailLevel;
}

export function LightingRig({ detail }: LightingRigProps) {
  return (
    <>
      {/* Ambient base — warm cream, generous so dark metals are always visible */}
      <ambientLight intensity={0.6} color="#F0E6D3" />

      {/* Hemisphere for natural sky/ground fill */}
      <hemisphereLight
        color="#FFF5E6"
        groundColor="#2A1A0A"
        intensity={0.4}
      />

      {/* Key directional — strong, warm white from upper-right */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        color="#FFF5E6"
        castShadow={detail === "high"}
        shadow-mapSize-width={detail === "high" ? 1024 : undefined}
        shadow-mapSize-height={detail === "high" ? 1024 : undefined}
      />

      {/* Fill from opposite side */}
      <directionalLight
        position={[-4, 6, -3]}
        intensity={0.5}
        color="#E8DCC8"
      />

      {/* Amber accent from below-left */}
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#F5A623" />

      {detail === "high" && (
        <>
          {/* Rim/back light for edge separation */}
          <pointLight position={[-2, 3, -4]} intensity={0.8} color="#F5A623" />

          {/* Copper overhead spot */}
          <pointLight position={[0, 4, 0]} intensity={0.3} color="#D4883A" />

          {/* Environment map: "city" gives bright reflections on metal surfaces */}
          <Environment preset="city" />

          {/* Contact shadows for grounding */}
          <ContactShadows
            opacity={0.35}
            scale={10}
            blur={2.5}
            position={[0, 0, 0]}
          />
        </>
      )}
    </>
  );
}
