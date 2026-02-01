export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export const SERVO_SPRING: SpringConfig = {
  stiffness: 180,
  damping: 14,
  mass: 1,
};

export const SMOOTH_SPRING: SpringConfig = {
  stiffness: 120,
  damping: 20,
  mass: 1,
};

const MAX_DT = 0.05; // 50ms cap to prevent spiral-of-death on tab unfocus

export interface SpringState {
  position: number;
  velocity: number;
}

/**
 * Advance a single spring by dt seconds toward the target.
 * Uses semi-implicit Euler integration.
 */
export function stepSpring(
  state: SpringState,
  target: number,
  config: SpringConfig,
  dt: number,
): SpringState {
  const clampedDt = Math.min(dt, MAX_DT);
  const { stiffness, damping, mass } = config;

  const displacement = state.position - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * state.velocity;
  const acceleration = (springForce + dampingForce) / mass;

  const newVelocity = state.velocity + acceleration * clampedDt;
  const newPosition = state.position + newVelocity * clampedDt;

  return { position: newPosition, velocity: newVelocity };
}
