"use client";

import dynamic from "next/dynamic";
import { useIntersectionReveal } from "@/hooks/use-intersection-reveal";

const ConceptComparison = dynamic(
  () => import("./concept-comparison").then((m) => m.ConceptComparison),
  { ssr: false }
);

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

        {/* Right — 3D split-screen comparison */}
        <div
          className="flex items-center justify-center transition-all duration-1000 delay-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateX(0)" : "translateX(30px)",
          }}
        >
          <ConceptComparison isVisible={isVisible} />
        </div>
      </div>
    </section>
  );
}
