import type { Angles } from "@/lib/types";

export interface JoystickTestKeyframe {
  label: string;
  armAngles: Angles;
  joystickGlow: number;
  durationMs: number;
  effect?:
    | "pulse-up"
    | "pulse-down"
    | "pulse-left"
    | "pulse-right"
    | "check"
    | null;
}

/**
 * Joystick position on the ground plane.
 * The arm's FK chain extends along -X (seg1/seg2 rotate around Z),
 * so the joystick sits on the -X axis where the gripper reaches.
 * At center grip [90, 143, 25, 45] the gripper tip ≈ [-2.5, 0.46, 0].
 */
export const JOYSTICK_POSITION: [number, number, number] = [-2.5, 0, 0];

// Center grip angles — gripper holds the joystick stick centered.
// FK places gripper tip at ≈ [-2.5, 0.46, 0], matching the knob at Y≈0.43.
const C: Angles = [90, 143, 25, 45];

export const JOYSTICK_TEST_SEQUENCE: JoystickTestKeyframe[] = [
  // 0 — Rest
  { label: "Rest",       armAngles: [90, 90, 90, 90],   joystickGlow: 0,   durationMs: 2000 },
  // 1 — Approach
  { label: "Approach",   armAngles: [90, 130, 40, 90],   joystickGlow: 0.2, durationMs: 2500 },
  // 2 — Lower
  { label: "Lower",      armAngles: [90, 140, 28, 90],   joystickGlow: 0.3, durationMs: 1500 },
  // 3 — Grip
  { label: "Grip",       armAngles: C,                    joystickGlow: 0.5, durationMs: 1000 },
  // 4 — Test Up (push stick further -X)
  { label: "Test Up",    armAngles: [90, 146, 25, 45],   joystickGlow: 0.8, durationMs: 1500, effect: "pulse-up" },
  // 5 — Center
  { label: "Center",     armAngles: C,                    joystickGlow: 0.5, durationMs: 800,  effect: "check" },
  // 6 — Test Down (pull stick toward +X)
  { label: "Test Down",  armAngles: [90, 140, 25, 45],   joystickGlow: 0.8, durationMs: 1500, effect: "pulse-down" },
  // 7 — Center
  { label: "Center",     armAngles: C,                    joystickGlow: 0.5, durationMs: 800,  effect: "check" },
  // 8 — Test Left (push stick toward -Z)
  { label: "Test Left",  armAngles: [87, 143, 25, 45],   joystickGlow: 0.8, durationMs: 1500, effect: "pulse-left" },
  // 9 — Center
  { label: "Center",     armAngles: C,                    joystickGlow: 0.5, durationMs: 800,  effect: "check" },
  // 10 — Test Right (push stick toward +Z)
  { label: "Test Right", armAngles: [93, 143, 25, 45],   joystickGlow: 0.8, durationMs: 1500, effect: "pulse-right" },
  // 11 — Center
  { label: "Center",     armAngles: C,                    joystickGlow: 0.5, durationMs: 800,  effect: "check" },
  // 12 — Release
  { label: "Release",    armAngles: [90, 143, 25, 90],   joystickGlow: 0.2, durationMs: 1000 },
  // 13 — Retract
  { label: "Retract",    armAngles: [90, 120, 60, 90],   joystickGlow: 0,   durationMs: 2000 },
];
