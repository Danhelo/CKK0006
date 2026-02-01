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
            {/* Before / After comparison */}
            <div className="grid grid-cols-2 divide-x" style={{ borderColor: "var(--border)" }}>
              {/* Manual Testing */}
              <div className="p-4">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                  Manual Testing
                </p>
                <div className="mx-auto mb-3 h-20 w-full rounded" style={{ background: "var(--surface-2)" }}>
                  <svg viewBox="0 0 200 80" className="h-full w-full" fill="none">
                    <path d="M 20 60 Q 100 20 180 30" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
                    <path d="M 20 60 Q 98 22 180 31" stroke="var(--green-pass)" strokeWidth="2" opacity="0.8" />
                  </svg>
                </div>
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ background: "var(--green-pass)", color: "#0C0C0C" }}>
                    PASS
                  </span>
                </div>
              </div>

              {/* Accessware Testing */}
              <div className="p-4">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-tertiary)" }}>
                  Accessware Testing
                </p>
                <div className="mx-auto mb-3 h-20 w-full rounded" style={{ background: "var(--surface-2)" }}>
                  <svg viewBox="0 0 200 80" className="h-full w-full" fill="none">
                    <path d="M 20 60 Q 100 20 180 30" stroke="var(--teal)" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
                    <path d="M 20 60 Q 60 45 80 35 Q 110 18 130 25 Q 160 32 180 38" stroke="var(--amber-400)" strokeWidth="2" opacity="0.8" />
                    <circle cx="80" cy="35" r="4" fill="var(--amber-400)" opacity="0.5">
                      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="130" cy="25" r="4" fill="var(--amber-400)" opacity="0.5">
                      <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                    </circle>
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" style={{ background: "var(--yellow-warn)", color: "#0C0C0C" }}>
                    WARNING
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--yellow-warn)" }}>2 ergonomic flags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
