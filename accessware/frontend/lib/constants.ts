/* ═══════════════════════════════════════════════════
   Accessware — Constants
   ═══════════════════════════════════════════════════ */

import type { Angles } from "./types";

// ── API URLs ──
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

// ── Arm physical dimensions (matching 3D model units) ──
export const ARM_DIMENSIONS = {
  baseRadius: 0.8,
  baseHeight: 0.5,
  segment1Length: 1.5,
  segment2Length: 1.0,
  gripperLength: 0.3,
  jointRadius: 0.12,
} as const;

// ── Servo rest positions (90 degrees each) ──
export const SERVO_REST: Angles = [90, 90, 90, 90];

// ── Servo labels ──
export const SERVO_LABELS = [
  "Base rotation",
  "Arm segment 1",
  "Arm segment 2",
  "Gripper",
] as const;

// ── Speed constraints ──
export const SPEED_MIN = 5;
export const SPEED_MAX = 30;
export const SPEED_DEFAULT = 15;

// ── WebSocket reconnect ──
export const WS_RECONNECT_BASE_MS = 1000;
export const WS_RECONNECT_MAX_MS = 8000;

// ── Presentation mode ──
export const PRESENTATION_DELAY_MS = 5000;

// ── Record mode ──
export const JOG_DEBOUNCE_MS = 50;
export const MAX_CAPTURED_POSES = 20;
