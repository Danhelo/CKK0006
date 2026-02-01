"use client";

import { useState, useEffect, useRef } from "react";
import type { Angles } from "@/lib/types";
import { SERVO_REST } from "@/lib/constants";
import { JOYSTICK_TEST_SEQUENCE } from "./joystick-test-choreography";

export interface ChoreographyState {
  armAngles: Angles;
  joystickGlow: number;
  activeEffect: string | null;
  currentLabel: string;
}

const REST_STATE: ChoreographyState = {
  armAngles: SERVO_REST,
  joystickGlow: 0,
  activeEffect: null,
  currentLabel: "Idle",
};

/**
 * Drives the joystick test keyframe sequence.
 * Returns arm target angles, glow, active effect, and label.
 * Joystick tilt is derived mechanically from the arm's spring angles
 * by JoystickModel — no tilt data needed here.
 * Works both inside and outside R3F Canvas context.
 */
export function useJoystickChoreography(
  enabled: boolean,
  speedMultiplier: number = 1,
): ChoreographyState {
  const [stepIndex, setStepIndex] = useState(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Reset step when disabled
  useEffect(() => {
    if (!enabled) {
      setStepIndex(0);
    }
  }, [enabled]);

  // Step timer
  useEffect(() => {
    if (!enabled) return;

    const keyframe = JOYSTICK_TEST_SEQUENCE[stepIndex];
    if (!keyframe) return;

    const duration = keyframe.durationMs / speedMultiplier;
    const timer = setTimeout(() => {
      if (!enabledRef.current) return;
      setStepIndex((prev) => (prev + 1) % JOYSTICK_TEST_SEQUENCE.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [enabled, stepIndex, speedMultiplier]);

  if (!enabled) return REST_STATE;

  const keyframe = JOYSTICK_TEST_SEQUENCE[stepIndex];
  if (!keyframe) return REST_STATE;

  return {
    armAngles: keyframe.armAngles,
    joystickGlow: keyframe.joystickGlow,
    activeEffect: keyframe.effect ?? null,
    currentLabel: keyframe.label,
  };
}
