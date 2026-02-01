"use client";

import { useRef, useEffect, useState } from "react";
import { Arm3D } from "@/components/arm-3d";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import type { Angles } from "@/lib/types";
import { SERVO_REST } from "@/lib/constants";

// Demo keyframes: rest → reach → grip → retract → rest
const DEMO_POSES: Angles[] = [
  [90, 90, 90, 90],    // rest
  [90, 60, 120, 90],   // reach forward
  [90, 60, 120, 40],   // close gripper
  [90, 90, 90, 40],    // retract
  [120, 70, 110, 90],  // rotate + reach
  [120, 70, 110, 30],  // grip
  [90, 90, 90, 90],    // back to rest
];

const POSE_DURATION_MS = 2000;

export function DemoPreview() {
  const { ref, isVisible } = useIntersectionReveal();
  const [currentPose, setCurrentPose] = useState(0);
  const [angles, setAngles] = useState<Angles>(SERVO_REST);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentPose((prev) => {
        const next = (prev + 1) % DEMO_POSES.length;
        setAngles(DEMO_POSES[next]);
        return next;
      });
    }, POSE_DURATION_MS);

    // Start first pose
    setAngles(DEMO_POSES[0]);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={ref} className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p
          className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] transition-all duration-700"
          style={{
            color: "var(--amber-500)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          Live Preview
        </p>
        <h2
          className="mb-10 text-center font-display text-3xl font-bold transition-all duration-1000 delay-200 sm:text-4xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          See it move
        </h2>

        <div
          className="overflow-hidden rounded-lg transition-all duration-1000 delay-400"
          style={{
            border: "1px solid var(--border-accent)",
            boxShadow: "0 0 40px rgba(245,166,35,0.08), 0 0 80px rgba(245,166,35,0.03)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {/* Status bar */}
          <div
            className="flex items-center justify-between border-b px-4 py-2"
            style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "var(--amber-400)" }}
              />
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                Demo Mode
              </span>
            </div>
            <span className="font-mono text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              [{angles.join(", ")}]
            </span>
          </div>

          {/* 3D Canvas */}
          <div className="h-72 md:h-96">
            {isVisible && (
              <Arm3D angles={angles} autoRotate />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
