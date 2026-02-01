"use client";

import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";
import { StaggeredText } from "./staggered-text";

export function ProblemSection() {
  const { ref, isVisible } = useIntersectionReveal();

  return (
    <section
      ref={ref}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24"
    >
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 grid-pattern" />

      <div className="relative z-10 max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          <StaggeredText
            text="The invisible gap"
            isVisible={isVisible}
            delayMs={100}
          />
        </h2>

        <div
          className="mt-8 space-y-4 text-lg leading-relaxed transition-all duration-1000 delay-500"
          style={{
            color: "var(--text-secondary)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p>
            Accessibility hardware ships with{" "}
            <span style={{ color: "var(--amber-400)", fontWeight: 600 }}>
              assumptions baked in
            </span>
            . Button force thresholds, switch travel distances, grip clearances —
            all spec&apos;d in a lab, tested by engineers, then handed to people
            whose bodies work differently.
          </p>
          <p>
            Between the{" "}
            <span style={{ color: "var(--teal)" }}>designed path</span> and the{" "}
            <span style={{ color: "var(--amber-400)" }}>actual path</span>, there&apos;s
            a gap. Most teams{" "}
            <span style={{ color: "var(--text-tertiary)" }}>never see it</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
