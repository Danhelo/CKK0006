import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ARM_DIMENSIONS } from "@/lib/constants";
import { useSpringAngles } from "./use-spring-angles";
import { useArmInteraction } from "./use-arm-interaction";
import { BasePlatform } from "./parts/base-platform";
import { ArmSegment } from "./parts/arm-segment";
import { JointSphere } from "./parts/joint-sphere";
import { Gripper } from "./parts/gripper";
import type { ArmModelProps } from "./types";

export function ArmModel({
  angles,
  detail,
  onJointSelect,
  onJointHover,
  selectedJoint,
  springAnglesRef,
}: ArmModelProps) {
  const { baseHeight, segment1Length, segment2Length } = ARM_DIMENSIONS;

  const baseRef = useRef<THREE.Group>(null);
  const seg1Ref = useRef<THREE.Group>(null);
  const seg2Ref = useRef<THREE.Group>(null);

  const currentAngles = useSpringAngles(angles, detail);

  const interaction = useArmInteraction(
    detail,
    onJointSelect,
    onJointHover,
    selectedJoint,
  );

  // Finger spread derived from servo4 angle
  const fingerSpreadRef = useRef(0);

  useFrame(() => {
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

    fingerSpreadRef.current = ((s4 - 90) / 180) * 0.12;

    // Expose spring-interpolated angles to siblings (e.g. JoystickModel)
    if (springAnglesRef) {
      springAnglesRef.current = currentAngles.current;
    }
  });

  return (
    <group>
      {/* Base platform with embedded servo */}
      <BasePlatform detail={detail} />

      {/* Rotation group — Servo 1 (base) */}
      <group ref={baseRef} position={[0, baseHeight, 0]}>
        <JointSphere
          position={[0, 0, 0]}
          detail={detail}
          jointIndex={0}
          emissiveIntensity={interaction.getEmissiveIntensity(0)}
          scale={interaction.getScale(0)}
          onPointerOver={() => interaction.onPointerOver(0)}
          onPointerOut={interaction.onPointerOut}
          onClick={() => interaction.onClick(0)}
        />

        {/* Segment 1 group — Servo 2 */}
        <group ref={seg1Ref}>
          <ArmSegment
            detail={detail}
            length={segment1Length}
            width={0.2}
            materialPreset="mid"
          />

          {/* Joint between seg1 and seg2 */}
          <group position={[0, segment1Length, 0]}>
            <JointSphere
              position={[0, 0, 0]}
              detail={detail}
              jointIndex={1}
              emissiveIntensity={interaction.getEmissiveIntensity(1)}
              scale={interaction.getScale(1)}
              onPointerOver={() => interaction.onPointerOver(1)}
              onPointerOut={interaction.onPointerOut}
              onClick={() => interaction.onClick(1)}
            />

            {/* Segment 2 group — Servo 3 */}
            <group ref={seg2Ref}>
              <ArmSegment
                detail={detail}
                length={segment2Length}
                width={0.16}
                materialPreset="light"
              />

              {/* Gripper mount */}
              <group position={[0, segment2Length, 0]}>
                <JointSphere
                  position={[0, 0, 0]}
                  detail={detail}
                  jointIndex={2}
                  emissiveIntensity={interaction.getEmissiveIntensity(2)}
                  scale={interaction.getScale(2)}
                  onPointerOver={() => interaction.onPointerOver(2)}
                  onPointerOut={interaction.onPointerOut}
                  onClick={() => interaction.onClick(2)}
                />

                {/* Gripper group — Servo 4 */}
                <Gripper detail={detail} fingerSpreadRef={fingerSpreadRef} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
