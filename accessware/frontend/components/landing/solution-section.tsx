"use client";

import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

export function SolutionSection() {
  const { ref, isVisible } = useIntersectionReveal();

  return (
    <section
      ref={ref}
      className="relative flex min-h-[60vh] items-center justify-center px-6 py-24"
    >
      <div className="relative z-10 max-w-3xl text-center">
        <p
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] transition-all duration-700"
          style={{
            color: "var(--amber-500)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          The solution
        </p>

        <h2
          className="font-display text-3xl font-bold leading-tight transition-all duration-1000 delay-200 sm:text-4xl md:text-5xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          Meet Accessware
        </h2>

        <p
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed transition-all duration-1000 delay-500"
          style={{
            color: "var(--text-secondary)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          A 4-axis robotic arm that physically operates accessibility devices,
          records the actual motion path, compares it against the designed spec,
          and flags every divergence — automatically, repeatably, without human
          bias.
        </p>

        {/* Dashboard preview mockup */}
        <div
          className="mx-auto mt-12 max-w-lg transition-all duration-1000 delay-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          }}
        >
          <div
            className="overflow-hidden rounded-lg border-shimmer"
            style={{ background: "var(--surface-1)" }}
          >
            {/* Fake title bar */}
            <div
              className="flex items-center gap-2 border-b px-4 py-2.5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--red-warm)" }} />
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--yellow-warn)" }} />
              <div className="h-2 w-2 rounded-full" style={{ background: "var(--green-pass)" }} />
              <span
                className="ml-2 text-[10px] font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                Accessware Dashboard
              </span>
            </div>
            {/* Skeleton content */}
            <div className="flex gap-4 p-4">
              {/* 3D area */}
              <div
                className="flex h-32 flex-1 items-center justify-center rounded"
                style={{ background: "var(--surface-2)" }}
              >
                <div
                  className="h-16 w-12 rounded"
                  style={{
                    background: "linear-gradient(180deg, var(--surface-4), var(--surface-3))",
                    boxShadow: "0 0 20px rgba(245,166,35,0.1)",
                  }}
                />
              </div>
              {/* Controls area */}
              <div className="flex w-24 flex-col gap-2">
                <div className="h-3 w-full rounded" style={{ background: "var(--surface-3)" }} />
                <div className="h-6 w-full rounded" style={{ background: "var(--amber-400)", opacity: 0.3 }} />
                <div className="h-3 w-3/4 rounded" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-full rounded" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-5/6 rounded" style={{ background: "var(--surface-3)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
