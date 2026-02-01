import { ServoBody } from "./servo-body";
import { BracketPlate } from "./bracket-plate";
import { METAL_MID, METAL_LIGHT, EDGE_HIGHLIGHT } from "../materials";
import type { DetailLevel } from "../types";

interface ArmSegmentProps {
  detail: DetailLevel;
  length: number;
  width?: number;
  materialPreset?: "mid" | "light";
}

// Fixed geometry constants
const SERVO_CENTER_Y = 0.06;                  // servo body center
const BRACKET_THICKNESS = 0.04;
const BOTTOM_BRACKET_CENTER_Y = 0.14;         // bracket center
const BOTTOM_BRACKET_TOP = BOTTOM_BRACKET_CENTER_Y + BRACKET_THICKNESS / 2; // 0.16

/**
 * One arm segment: servo body at pivot end, bottom bracket, beam, edge highlight, top bracket.
 * Beam spans seamlessly from bottom bracket top to top bracket bottom.
 */
export function ArmSegment({
  detail,
  length,
  width = 0.2,
  materialPreset = "mid",
}: ArmSegmentProps) {
  const mat = materialPreset === "mid" ? METAL_MID : METAL_LIGHT;
  const bracketWidth = width + 0.02;
  const bracketDepth = width - 0.02;

  const topBracketCenter = length - 0.02;
  const topBracketBottom = topBracketCenter - BRACKET_THICKNESS / 2; // length - 0.04

  // Beam fills from bottom bracket top to top bracket bottom — no gaps
  const beamBottom = BOTTOM_BRACKET_TOP;               // 0.16
  const beamTop = topBracketBottom;                     // length - 0.04
  const beamHeight = beamTop - beamBottom;
  const beamCenter = beamBottom + beamHeight / 2;

  return (
    <group>
      {/* Servo body at pivot end */}
      <ServoBody
        detail={detail}
        position={[0, SERVO_CENTER_Y, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Bottom bracket plate */}
      <BracketPlate
        detail={detail}
        width={bracketWidth}
        depth={bracketDepth}
        position={[0, BOTTOM_BRACKET_CENTER_Y, 0]}
      />

      {/* Main beam — fills between brackets */}
      <mesh position={[0, beamCenter, 0]}>
        <boxGeometry args={[width, beamHeight, width]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Edge highlight strip */}
      <mesh position={[width / 2 + 0.005, beamCenter, 0]}>
        <boxGeometry args={[0.01, beamHeight, width + 0.01]} />
        <meshStandardMaterial {...EDGE_HIGHLIGHT} />
      </mesh>

      {/* Top bracket plate */}
      <BracketPlate
        detail={detail}
        width={bracketWidth}
        depth={bracketDepth}
        position={[0, topBracketCenter, 0]}
      />
    </group>
  );
}
