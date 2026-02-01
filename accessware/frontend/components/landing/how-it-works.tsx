"use client";

import { FileText, Cog, BarChart3 } from "lucide-react";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Define a test",
    description:
      "Record servo positions by hand or write a JSON spec. Define the designed path — the motion sequence the device should support.",
  },
  {
    icon: Cog,
    number: "02",
    title: "Robot executes",
    description:
      "The 4-axis arm physically operates the device, streaming real-time angles and recording the actual motion path at every tick.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "See where design fails",
    description:
      "Compare designed vs. actual paths. Get range coverage, repeatability scores, path divergence, and ergonomic warnings — instantly.",
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useIntersectionReveal();

  return (
    <section ref={ref} className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p
          className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] transition-all duration-700"
          style={{
            color: "var(--amber-500)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          How it works
        </p>
        <h2
          className="mb-16 text-center font-display text-3xl font-bold transition-all duration-1000 delay-200 sm:text-4xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          Three steps to better hardware
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group rounded-lg p-6 transition-all duration-700"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${400 + i * 200}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-md transition-colors"
                  style={{
                    background: "var(--amber-glow)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  <Icon size={18} style={{ color: "var(--amber-400)" }} />
                </div>

                {/* Number */}
                <span
                  className="font-mono text-xs font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {step.number}
                </span>

                {/* Title */}
                <h3
                  className="mt-1 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
