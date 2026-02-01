import type { Angles } from "@/lib/types";

export type DetailLevel = "low" | "high";

export interface Arm3DProps {
  angles?: Angles;
  actualTrail?: [number, number, number][];
  designedTrail?: [number, number, number][];
  comparisonTrail?: [number, number, number][];
  showDesigned?: boolean;
  autoRotate?: boolean;
  detail?: DetailLevel;
  onJointSelect?: (jointIndex: number | null) => void;
  onJointHover?: (jointIndex: number | null) => void;
  selectedJoint?: number | null;
}

export interface ArmModelProps {
  angles: Angles;
  detail: DetailLevel;
  onJointSelect?: (jointIndex: number | null) => void;
  onJointHover?: (jointIndex: number | null) => void;
  selectedJoint?: number | null;
}
