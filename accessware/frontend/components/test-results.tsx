"use client";

import { cva } from "class-variance-authority";
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestResult, RangeCoverage } from "@/lib/types";
import { SERVO_LABELS } from "@/lib/constants";

const verdictBadge = cva(
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider",
  {
    variants: {
      verdict: {
        pass: "",
        warning: "",
        fail: "",
      },
    },
  }
);

const verdictStyles: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  pass: { bg: "var(--green-pass)", color: "#0C0C0C", icon: CheckCircle },
  warning: { bg: "var(--yellow-warn)", color: "#0C0C0C", icon: AlertTriangle },
  fail: { bg: "var(--red-warm)", color: "#FFF", icon: XCircle },
};

function RangeBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-28 shrink-0 text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: `linear-gradient(90deg, var(--amber-600), var(--amber-400))`,
          }}
        />
      </div>
      <span
        className="w-10 text-right font-mono text-xs tabular-nums"
        style={{ color: "var(--text-primary)" }}
      >
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

interface TestResultsProps {
  results: TestResult[];
}

export function TestResults({ results }: TestResultsProps) {
  if (!results.length) return null;

  // Aggregate: use last repeat for display, show worst verdict
  const lastResult = results[results.length - 1];
  const worstVerdict = results.reduce<"pass" | "warning" | "fail">((worst, r) => {
    if (r.verdict === "fail") return "fail";
    if (r.verdict === "warning" && worst !== "fail") return "warning";
    return worst;
  }, "pass");

  const vs = verdictStyles[worstVerdict];
  const VerdictIcon = vs.icon;

  return (
    <div className="flex flex-col gap-4">
      <h3
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-tertiary)" }}
      >
        Results
      </h3>

      {/* ── Verdict Badge ── */}
      <div className="flex justify-center">
        <div
          className={verdictBadge({ verdict: worstVerdict })}
          style={{ background: vs.bg, color: vs.color }}
        >
          <VerdictIcon size={18} />
          {worstVerdict}
        </div>
      </div>

      {/* ── Range of Motion ── */}
      <div
        className="rounded-md p-4"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <h4
          className="mb-3 flex items-center gap-2 text-xs font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          <Activity size={12} style={{ color: "var(--amber-400)" }} />
          Range of Motion
        </h4>
        <div className="flex flex-col gap-2.5">
          {(Object.entries(lastResult.range_coverage) as [keyof RangeCoverage, number][]).map(
            ([key, value], i) => (
              <RangeBar key={key} label={SERVO_LABELS[i]} value={value} />
            )
          )}
        </div>
      </div>

      {/* ── Repeatability + Path Divergence ── */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-md p-4 text-center"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-tertiary)" }}
          >
            Repeatability
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {lastResult.repeatability.toFixed(1)}&deg;
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {lastResult.repeatability < 2
              ? "Excellent"
              : lastResult.repeatability < 5
                ? "Good"
                : "Poor"}
          </p>
        </div>

        <div
          className="rounded-md p-4 text-center"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-tertiary)" }}
          >
            Path Divergence
          </p>
          <p
            className="mt-1 font-mono text-2xl font-bold tabular-nums"
            style={{
              color:
                lastResult.path_divergence > 10
                  ? "var(--red-warm)"
                  : lastResult.path_divergence > 5
                    ? "var(--yellow-warn)"
                    : "var(--green-pass)",
            }}
          >
            {lastResult.path_divergence.toFixed(1)}%
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            from designed path
          </p>
        </div>
      </div>

      {/* ── Ergonomic Flags ── */}
      {lastResult.ergonomic_flags.length > 0 && (
        <div
          className="rounded-md p-4"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          <h4
            className="mb-2 flex items-center gap-2 text-xs font-semibold"
            style={{ color: "var(--yellow-warn)" }}
          >
            <AlertOctagon size={12} />
            Ergonomic Flags
          </h4>
          <ul className="flex flex-col gap-1.5">
            {lastResult.ergonomic_flags.map((flag, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <AlertTriangle size={10} className="mt-0.5 shrink-0" style={{ color: "var(--yellow-warn)" }} />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Timing ── */}
      <div
        className="flex items-center justify-between rounded-md px-4 py-3"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: "var(--amber-400)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            Total Time
          </span>
        </div>
        <span
          className="font-mono text-sm font-bold tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {(lastResult.total_time_ms / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
