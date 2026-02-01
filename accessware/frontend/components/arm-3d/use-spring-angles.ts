import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Angles } from "@/lib/types";
import { SERVO_REST } from "@/lib/constants";
import {
  stepSpring,
  SERVO_SPRING,
  SMOOTH_SPRING,
  type SpringConfig,
  type SpringState,
} from "./animation";
import type { DetailLevel } from "./types";

export function useSpringAngles(
  targetAngles: Angles,
  detail: DetailLevel,
): React.MutableRefObject<Angles> {
  const config: SpringConfig = detail === "high" ? SERVO_SPRING : SMOOTH_SPRING;

  const springs = useRef<SpringState[]>(
    SERVO_REST.map((a) => ({ position: a, velocity: 0 })),
  );

  const currentAngles = useRef<Angles>([...SERVO_REST]);

  // Check prefers-reduced-motion at mount time
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useFrame((_, delta) => {
    const effectiveConfig = reducedMotion.current ? SMOOTH_SPRING : config;

    for (let i = 0; i < 4; i++) {
      springs.current[i] = stepSpring(
        springs.current[i],
        targetAngles[i],
        effectiveConfig,
        delta,
      );
      currentAngles.current[i] = springs.current[i].position;
    }
  });

  return currentAngles;
}
