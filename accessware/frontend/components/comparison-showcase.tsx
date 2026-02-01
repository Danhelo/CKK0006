"use client";

import dynamic from "next/dynamic";
import { AnimatedNumber } from "@/components/ui/animated-number";

const Arm3D = dynamic(
  () => import("@/components/arm-3d").then((m) => m.Arm3D),
  { ssr: false }
);

// Simulated "Full Range Sweep" trail — wide, smooth coverage
const FULL_RANGE_TRAIL: [number, number, number][] = [
  [0, 0.5, 0], [0.3, 0.9, 0.2], [0.7, 1.4, 0.4], [1.0, 1.8, 0.3],
  [1.2, 2.0, 0.1], [1.1, 2.1, -0.2], [0.8, 1.9, -0.4], [0.4, 1.5, -0.3],
  [0.1, 1.1, -0.1], [-0.2, 0.8, 0.1], [-0.3, 0.6, 0.3], [0, 0.5, 0.1],
];

// Simulated "Limited Mobility" trail — restricted, hesitant movement
const LIMITED_TRAIL: [number, number, number][] = [
  [0, 0.5, 0], [0.15, 0.7, 0.1], [0.3, 0.9, 0.15], [0.4, 1.0, 0.1],
  [0.45, 1.1, 0.05], [0.42, 1.05, -0.05], [0.35, 0.95, -0.1], [0.25, 0.8, -0.08],
  [0.15, 0.65, -0.02], [0.05, 0.55, 0.05], [0, 0.5, 0.02], [0, 0.5, 0],
];

// Designed path both are compared against
const DESIGNED_TRAIL: [number, number, number][] = [
  [0, 0.5, 0], [0.3, 0.95, 0.2], [0.7, 1.5, 0.35], [1.0, 1.9, 0.25],
  [1.15, 2.1, 0.05], [1.05, 2.05, -0.2], [0.75, 1.85, -0.35], [0.35, 1.45, -0.25],
  [0.05, 1.05, -0.1], [-0.15, 0.75, 0.08], [-0.25, 0.55, 0.2], [0, 0.5, 0.05],
];

interface MetricRowProps {
  label: string;
  valueA: number;
  valueB: number;
  suffix: string;
  decimals?: number;
  higherIsBetter?: boolean;
}

function MetricRow({ label, valueA, valueB, suffix, decimals = 1, higherIsBetter = true }: MetricRowProps) {
  const aBetter = higherIsBetter ? valueA >= valueB : valueA <= valueB;
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className="w-28 shrink-0 text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div className="flex flex-1 gap-4">
        <span
          className="flex-1 text-right font-mono text-sm tabular-nums"
          style={{ color: aBetter ? "var(--green-pass)" : "var(--text-primary)" }}
        >
          <AnimatedNumber value={valueA} format="float" decimals={decimals} suffix={suffix} duration={1000} />
        </span>
        <span
          className="flex-1 text-right font-mono text-sm tabular-nums"
          style={{ color: !aBetter ? "var(--green-pass)" : "var(--text-primary)" }}
        >
          <AnimatedNumber value={valueB} format="float" decimals={decimals} suffix={suffix} duration={1000} />
        </span>
      </div>
    </div>
  );
}

export function ComparisonShowcase() {
  return (
    <div className="flex flex-col gap-5">
      <h3
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Comparison: Full Range vs Limited Mobility
      </h3>

      {/* 3D View with overlaid trails */}
      <div
        className="h-64 overflow-hidden rounded-lg"
        style={{ border: "1px solid var(--border)" }}
      >
        <Arm3D
          actualTrail={FULL_RANGE_TRAIL}
          designedTrail={DESIGNED_TRAIL}
          comparisonTrail={LIMITED_TRAIL}
          showDesigned
          autoRotate
          detail="high"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-6 rounded-full" style={{ background: "#F5A623" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Full Range Sweep</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-6 rounded-full" style={{ background: "#9B59B6" }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Limited Mobility</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-6 rounded-full" style={{ background: "#4ECDC4", opacity: 0.5 }} />
          <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Designed Path</span>
        </div>
      </div>

      {/* Side-by-side metrics */}
      <div
        className="rounded-md p-4"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        {/* Column headers */}
        <div className="mb-2 flex items-center gap-3">
          <span className="w-28 shrink-0" />
          <div className="flex flex-1 gap-4">
            <span
              className="flex-1 text-right text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#F5A623" }}
            >
              Full Range
            </span>
            <span
              className="flex-1 text-right text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "#9B59B6" }}
            >
              Limited
            </span>
          </div>
        </div>

        <div
          className="divide-y"
          style={{ borderColor: "var(--border)" }}
        >
          <MetricRow label="Range Coverage" valueA={92.4} valueB={34.8} suffix="%" higherIsBetter />
          <MetricRow label="Path Divergence" valueA={3.2} valueB={18.7} suffix="%" higherIsBetter={false} />
          <MetricRow label="Repeatability" valueA={1.4} valueB={4.8} suffix="°" higherIsBetter={false} />
          <MetricRow label="Total Time" valueA={12.3} valueB={8.1} suffix="s" />
        </div>
      </div>

      {/* Verdicts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-md p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase" style={{ background: "var(--green-pass)", color: "#0C0C0C" }}>
            PASS
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Full Range Sweep</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-md p-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase" style={{ background: "var(--yellow-warn)", color: "#0C0C0C" }}>
            WARNING
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Limited Mobility</span>
        </div>
      </div>
    </div>
  );
}
