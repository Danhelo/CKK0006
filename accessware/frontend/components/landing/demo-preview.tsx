"use client";

import { Arm3D } from "@/components/arm-3d";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { useJoystickChoreography } from "@/components/arm-3d/use-joystick-choreography";

export function DemoPreview() {
  const { ref, isVisible } = useIntersectionReveal();
  const choreography = useJoystickChoreography(isVisible, 1.0);

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
                {choreography.currentLabel}
              </span>
            </div>
            <span className="font-mono text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              [{choreography.armAngles.join(", ")}]
            </span>
          </div>

          {/* 3D Canvas */}
          <div className="h-72 md:h-96">
            {isVisible && (
              <Arm3D
                angles={choreography.armAngles}
                autoRotate
                detail="low"
                showJoystick
                joystickGlow={choreography.joystickGlow}
                joystickEffect={choreography.activeEffect}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
