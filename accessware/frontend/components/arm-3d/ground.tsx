import { MeshReflectorMaterial } from "@react-three/drei";
import type { DetailLevel } from "./types";

interface GroundProps {
  detail: DetailLevel;
}

export function Ground({ detail }: GroundProps) {
  return (
    <>
      {detail === "high" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <MeshReflectorMaterial
            mirror={0}
            blur={[300, 100]}
            resolution={512}
            mixBlur={1}
            mixStrength={0.5}
            roughness={0.9}
            depthScale={1}
            color="#0C0C0C"
            metalness={0.4}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#0C0C0C" roughness={1} metalness={0} />
        </mesh>
      )}

      {/* Grid overlay */}
      <gridHelper
        args={[10, 20, "#F0E6D3", "#F0E6D3"]}
        position={[0, 0, 0]}
        material-transparent={true}
        material-opacity={0.04}
      />
    </>
  );
}
