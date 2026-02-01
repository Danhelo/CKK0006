/* ═══════════════════════════════════════════════════
   Accessware — TypeScript types
   Matches backend API contract exactly
   ═══════════════════════════════════════════════════ */

// ── Servo angles tuple (always 4 elements) ──
export type Angles = [number, number, number, number];

// ── REST: GET /tests ──
export interface TestListItem {
  name: string;
  description: string;
  source: "bundled" | "custom";
  file: string;
}

// ── REST: GET /tests/{name} ──
export interface TestStep {
  angles: Angles;
  hold_ms: number;
  label: string;
}

export interface TestDefinition {
  name: string;
  description: string;
  designed_path: Angles[];
  steps: TestStep[];
  speed: number;
  repeat_count: number;
}

// ── WebSocket: Frontend → Backend ──
export type WsOutMessage =
  | { type: "run_test"; name: string }
  | { type: "pause" }
  | { type: "stop" }
  | { type: "jog"; angles: Angles; speed?: number }
  | { type: "read_angles" };

// ── WebSocket: Backend → Frontend ──
export type WsInMessage =
  | WsStateMessage
  | WsAnglesMessage
  | WsStepCompleteMessage
  | WsTestCompleteMessage
  | WsErrorMessage;

export interface WsStateMessage {
  type: "state";
  state?: "idle" | "running" | "paused" | "stopped" | "complete";
  test?: string;
  repeat?: number;
  step?: number;
  label?: string;
  target?: Angles;
  speed?: number;
  predicted_angles?: Angles;
  elapsed_ms?: number;
}

export interface WsAnglesMessage {
  type: "angles";
  angles: Angles;
}

export interface WsStepCompleteMessage {
  type: "step_complete";
  step: number;
  repeat: number;
}

export interface WsTestCompleteMessage {
  type: "test_complete";
  state: "complete" | "stopped";
  results: TestResult[];
}

export interface WsErrorMessage {
  type: "error";
  message: string;
}

// ── Test Results ──
export interface StepResult {
  label: string;
  target_angles: Angles;
  actual_start_angles: Angles;
  actual_end_angles: Angles;
  planned_duration_ms: number;
  actual_duration_ms: number;
  hold_ms: number;
}

export interface RangeCoverage {
  servo1: number;
  servo2: number;
  servo3: number;
  servo4: number;
}

export interface TestResult {
  test_name: string;
  repeat_index: number;
  steps: StepResult[];
  range_coverage: RangeCoverage;
  repeatability: number;
  total_time_ms: number;
  path_divergence: number;
  ergonomic_flags: string[];
  verdict: "pass" | "warning" | "fail";
}

// ── 3D Visualization State ──
export interface ArmState {
  angles: Angles;
  actualTrail: [number, number, number][];
  designedTrail: [number, number, number][];
  showDesigned: boolean;
}

// ── Run state machine ──
export type RunState = "idle" | "running" | "paused" | "stopped" | "complete";

// ── Captured pose for record mode ──
export interface CapturedPose {
  label: string;
  angles: Angles;
}
