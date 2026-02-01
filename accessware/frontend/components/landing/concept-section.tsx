"use client";

import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

export function ConceptSection() {
  const { ref, isVisible } = useIntersectionReveal();

  return (
    <section
      ref={ref}
      className="flex min-h-[70vh] items-center justify-center px-6 py-24"
    >
      <div className="grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
        {/* Left — text */}
        <div
          className="transition-all duration-1000"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(-30px)",
          }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: "var(--amber-500)" }}
          >
            The concept
          </p>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Desire paths — for hardware
          </h2>
          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            In urban design, a{" "}
            <em style={{ color: "var(--text-primary)" }}>desire path</em> is the
            trail worn into grass where people actually walk — diverging from the
            paved sidewalk. It reveals the gap between how a space was designed and
            how it&apos;s actually used.
          </p>
          <p
            className="mt-3 text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Accessware maps the same concept onto accessibility hardware. The{" "}
            <span style={{ color: "var(--teal)" }}>teal path</span> is how a
            device was designed to be operated. The{" "}
            <span style={{ color: "var(--amber-400)" }}>amber path</span> is what
            actually happens.
          </p>
        </div>

        {/* Right — diverging paths visualization */}
        <div
          className="flex items-center justify-center transition-all duration-1000 delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(30px)",
          }}
        >
          <svg
            viewBox="0 0 300 300"
            className="h-64 w-64 md:h-80 md:w-80"
            fill="none"
          >
            {/* Designed path — clean teal arc */}
            <path
              d="M 50 280 Q 150 100 250 40"
              stroke="var(--teal)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              opacity="0.7"
              style={{
                strokeDashoffset: isVisible ? 0 : 400,
                transition: "stroke-dashoffset 2s ease-out 0.5s",
              }}
            />
            {/* Actual path — rough amber with divergence */}
            <path
              d="M 50 280 Q 80 240 100 210 Q 130 170 140 155 Q 155 135 180 110 Q 200 85 220 70 Q 240 55 260 50"
              stroke="var(--amber-400)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: isVisible ? 0 : 400,
                transition: "stroke-dashoffset 2.5s ease-out 0.8s",
              }}
            />
            {/* Divergence area — faint fill */}
            <path
              d="M 50 280 Q 150 100 250 40 L 260 50 Q 200 85 140 155 Q 80 240 50 280 Z"
              fill="var(--amber-400)"
              style={{
                opacity: isVisible ? 0.05 : 0,
                transition: "opacity 1.5s ease-out 1.5s",
              }}
            />
            {/* Labels */}
            <text
              x="245"
              y="30"
              fill="var(--teal)"
              fontSize="10"
              fontFamily="var(--font-inter)"
              opacity={isVisible ? 0.8 : 0}
              style={{ transition: "opacity 0.5s ease-out 2s" }}
            >
              designed
            </text>
            <text
              x="255"
              y="65"
              fill="var(--amber-400)"
              fontSize="10"
              fontFamily="var(--font-inter)"
              opacity={isVisible ? 0.8 : 0}
              style={{ transition: "opacity 0.5s ease-out 2.2s" }}
            >
              actual
            </text>
            {/* Start point */}
            <circle cx="50" cy="280" r="4" fill="var(--text-tertiary)">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      </div>
    </section>
  );
}
