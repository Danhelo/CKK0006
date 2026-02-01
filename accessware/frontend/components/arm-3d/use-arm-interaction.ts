import { useRef, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import type { DetailLevel } from "./types";

interface JointInteraction {
  hoveredJoint: React.MutableRefObject<number | null>;
  selectedJoint: number | null;
  getEmissiveIntensity: (jointIndex: number) => number;
  getScale: (jointIndex: number) => number;
  onPointerOver: (jointIndex: number) => void;
  onPointerOut: () => void;
  onClick: (jointIndex: number) => void;
}

export function useArmInteraction(
  detail: DetailLevel,
  onJointSelect?: (jointIndex: number | null) => void,
  onJointHover?: (jointIndex: number | null) => void,
  selectedJoint?: number | null,
): JointInteraction {
  const hoveredJoint = useRef<number | null>(null);
  const intensities = useRef<number[]>([0.35, 0.35, 0.35, 0.35]);
  const scales = useRef<number[]>([1, 1, 1, 1]);

  useFrame((_, delta) => {
    if (detail !== "high") return;

    for (let i = 0; i < 4; i++) {
      const isHovered = hoveredJoint.current === i;
      const isSelected = selectedJoint === i;

      const targetIntensity = isSelected ? 0.9 : isHovered ? 0.7 : 0.35;
      const targetScale = isHovered ? 1.15 : 1;

      intensities.current[i] += (targetIntensity - intensities.current[i]) * Math.min(delta * 8, 1);
      scales.current[i] += (targetScale - scales.current[i]) * Math.min(delta * 10, 1);
    }
  });

  const onPointerOver = useCallback(
    (jointIndex: number) => {
      if (detail !== "high") return;
      hoveredJoint.current = jointIndex;
      onJointHover?.(jointIndex);
    },
    [detail, onJointHover],
  );

  const onPointerOut = useCallback(() => {
    if (detail !== "high") return;
    hoveredJoint.current = null;
    onJointHover?.(null);
  }, [detail, onJointHover]);

  const onClick = useCallback(
    (jointIndex: number) => {
      if (detail !== "high") return;
      onJointSelect?.(selectedJoint === jointIndex ? null : jointIndex);
    },
    [detail, onJointSelect, selectedJoint],
  );

  return {
    hoveredJoint,
    selectedJoint: selectedJoint ?? null,
    getEmissiveIntensity: (i: number) => intensities.current[i],
    getScale: (i: number) => scales.current[i],
    onPointerOver,
    onPointerOut,
    onClick,
  };
}
