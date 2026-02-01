"use client";

import { Play, Pause, Square, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestResults } from "./test-results";
import type {
  TestListItem,
  TestDefinition,
  TestResult,
  RunState,
} from "@/lib/types";
import { SPEED_MIN, SPEED_MAX, SPEED_DEFAULT } from "@/lib/constants";

interface TestRunnerProps {
  tests: TestListItem[];
  selectedTest: string | null;
  testDefinition: TestDefinition | null;
  runState: RunState;
  currentStep: number;
  currentRepeat: number;
  currentLabel: string;
  results: TestResult[];
  onSelectTest: (name: string) => void;
  onRun: () => void;
  onPause: () => void;
  onStop: () => void;
}

function StepLogEntry({
  index,
  label,
  angles,
  isCurrent,
  isComplete,
}: {
  index: number;
  label: string;
  angles: [number, number, number, number];
  isCurrent: boolean;
  isComplete: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 transition-all",
        isCurrent && "border-l-2",
      )}
      style={{
        background: isCurrent ? "var(--amber-glow)" : "transparent",
        borderLeftColor: isCurrent ? "var(--amber-400)" : "transparent",
        boxShadow: isComplete ? "inset 0 0 0 1px rgba(92, 184, 92, 0.15)" : "none",
        transition: "all 0.3s ease, box-shadow 0.6s ease",
      }}
    >
      {/* Status dot */}
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          background: isComplete
            ? "var(--green-pass)"
            : isCurrent
              ? "var(--amber-400)"
              : "var(--surface-4)",
        }}
      />
      {/* Step info */}
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
        <span
          className="ml-2 font-mono text-[10px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          [{angles.join(", ")}]
        </span>
      </div>
      {/* Step number */}
      <span
        className="font-mono text-[10px] tabular-nums"
        style={{ color: "var(--text-tertiary)" }}
      >
        #{index + 1}
      </span>
    </div>
  );
}

export function TestRunner({
  tests,
  selectedTest,
  testDefinition,
  runState,
  currentStep,
  currentRepeat,
  currentLabel,
  results,
  onSelectTest,
  onRun,
  onPause,
  onStop,
}: TestRunnerProps) {
  const isRunning = runState === "running";
  const isPaused = runState === "paused";
  const isComplete = runState === "complete";

  return (
    <div className="flex flex-col gap-5">
      {/* ── Test Selector ── */}
      <div>
        <label
          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          Test
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-md px-3 py-2.5 pr-8 text-sm font-medium transition-colors focus:outline-none"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            value={selectedTest || ""}
            onChange={(e) => onSelectTest(e.target.value)}
          >
            <option value="" disabled>
              Select a test...
            </option>
            {tests.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.source})
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>
      </div>

      {/* ── Transport Controls ── */}
      <div className="flex gap-2">
        <button
          onClick={onRun}
          disabled={!selectedTest || isRunning}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all",
            !selectedTest || isRunning
              ? "cursor-not-allowed opacity-40"
              : "hover:brightness-110 active:scale-[0.98]"
          )}
          style={{
            background: "var(--amber-400)",
            color: "var(--background)",
          }}
        >
          <Play size={14} fill="currentColor" />
          {isPaused ? "Resume" : "Run"}
        </button>
        <button
          onClick={onPause}
          disabled={!isRunning}
          className={cn(
            "flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all",
            !isRunning ? "cursor-not-allowed opacity-30" : "hover:brightness-125"
          )}
          style={{
            background: "var(--surface-3)",
            color: "var(--text-secondary)",
          }}
        >
          <Pause size={14} />
        </button>
        <button
          onClick={onStop}
          disabled={runState === "idle" || isComplete}
          className={cn(
            "flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium transition-all",
            (runState === "idle" || isComplete)
              ? "cursor-not-allowed opacity-30"
              : "hover:brightness-125"
          )}
          style={{
            background: "var(--surface-3)",
            color: "var(--text-secondary)",
          }}
        >
          <Square size={14} />
        </button>
      </div>

      {/* ── Progress Bar ── */}
      {(isRunning || isPaused) && testDefinition && (
        <div
          className="h-1.5 overflow-hidden rounded-full"
          style={{ background: "var(--surface-3)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / testDefinition.steps.length) * 100}%`,
              background: "linear-gradient(90deg, var(--amber-600), var(--amber-400))",
              boxShadow: "0 0 8px rgba(245,166,35,0.6)",
            }}
          />
        </div>
      )}

      {/* ── Repeat / Step indicator ── */}
      {(isRunning || isPaused) && testDefinition && (
        <div
          className="flex items-center justify-between rounded-md px-3 py-2 text-xs"
          style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        >
          <span>
            Repeat{" "}
            <span className="font-mono font-medium" style={{ color: "var(--amber-400)" }}>
              {currentRepeat + 1}/{testDefinition.repeat_count}
            </span>
          </span>
          <span>
            Step{" "}
            <span className="font-mono font-medium" style={{ color: "var(--amber-400)" }}>
              {currentStep + 1}/{testDefinition.steps.length}
            </span>
          </span>
          {currentLabel && (
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {currentLabel}
            </span>
          )}
        </div>
      )}

      {/* ── Step Log ── */}
      <div>
        <h3
          className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          Step Log
        </h3>
        <div
          className="max-h-56 overflow-y-auto rounded-md p-1"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
        >
          {testDefinition?.steps.length ? (
            testDefinition.steps.map((step, i) => (
              <StepLogEntry
                key={i}
                index={i}
                label={step.label}
                angles={step.angles}
                isCurrent={i === currentStep && (isRunning || isPaused)}
                isComplete={
                  isComplete || (isRunning && i < currentStep) || (isPaused && i < currentStep)
                }
              />
            ))
          ) : (
            <p
              className="px-3 py-4 text-center text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              Select a test to see steps.
            </p>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {results.length > 0 && <TestResults results={results} />}
    </div>
  );
}
