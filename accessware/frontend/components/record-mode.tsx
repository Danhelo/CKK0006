"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVO_LABELS, SERVO_REST, JOG_DEBOUNCE_MS, MAX_CAPTURED_POSES } from "@/lib/constants";
import type { Angles, CapturedPose } from "@/lib/types";

interface RecordModeProps {
  currentAngles: Angles;
  capturedPoses: CapturedPose[];
  onJog: (angles: Angles) => void;
  onCapture: (label: string) => void;
  onSave: (name: string, description: string) => void;
}

export function RecordMode({
  currentAngles,
  capturedPoses,
  onJog,
  onCapture,
  onSave,
}: RecordModeProps) {
  const [angles, setAngles] = useState<Angles>([...SERVO_REST]);
  const [stepName, setStepName] = useState("");
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSliderChange = useCallback(
    (index: number, value: number) => {
      setAngles((prev) => {
        const next = [...prev] as Angles;
        next[index] = value;

        // Debounced jog command
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onJog(next);
        }, JOG_DEBOUNCE_MS);

        return next;
      });
    },
    [onJog]
  );

  const handleCapture = useCallback(() => {
    if (!stepName.trim()) return;
    onCapture(stepName.trim());
    setStepName("");
  }, [stepName, onCapture]);

  const handleSave = useCallback(() => {
    if (!testName.trim()) return;
    onSave(testName.trim(), testDescription.trim());
    setTestName("");
    setTestDescription("");
  }, [testName, testDescription, onSave]);

  return (
    <div className="flex flex-col gap-5">
      <h3
        className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--amber-400)" }}
      >
        <GripVertical size={12} />
        Record Mode
      </h3>

      {/* ── Servo Sliders ── */}
      <div className="flex flex-col gap-4">
        {SERVO_LABELS.map((label, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between">
              <label
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </label>
              <span
                className="font-mono text-xs tabular-nums"
                style={{ color: "var(--amber-400)" }}
              >
                {angles[i]}&deg;
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              value={angles[i]}
              onChange={(e) => handleSliderChange(i, Number(e.target.value))}
              className="w-full accent-[var(--amber-400)]"
              style={{
                height: "4px",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Capture ── */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Step label..."
          value={stepName}
          onChange={(e) => setStepName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCapture()}
          className="flex-1 rounded-md px-3 py-2 text-sm focus:outline-none"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <button
          onClick={handleCapture}
          disabled={!stepName.trim() || capturedPoses.length >= MAX_CAPTURED_POSES}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
            !stepName.trim() ? "cursor-not-allowed opacity-40" : "hover:brightness-110 active:scale-[0.98]"
          )}
          style={{
            background: "var(--amber-400)",
            color: "var(--background)",
          }}
        >
          <Plus size={14} />
          Capture
        </button>
      </div>

      {/* ── Captured Poses ── */}
      <div
        className="max-h-40 overflow-y-auto rounded-md p-2"
        style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
      >
        {capturedPoses.length === 0 ? (
          <p
            className="py-3 text-center text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            No poses captured yet. Move sliders and click Capture.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {capturedPoses.map((pose, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded px-2 py-1.5"
                style={{ background: "var(--surface-2)" }}
              >
                <span
                  className="font-mono text-[10px] tabular-nums"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {i + 1}.
                </span>
                <span className="flex-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {pose.label}
                </span>
                <span
                  className="font-mono text-[10px] tabular-nums"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  [{pose.angles.join(", ")}]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Save Test ── */}
      {capturedPoses.length > 0 && (
        <div className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <input
            type="text"
            placeholder="Test name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="rounded-md px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
          <textarea
            placeholder="Description (optional)"
            value={testDescription}
            onChange={(e) => setTestDescription(e.target.value)}
            rows={2}
            className="resize-none rounded-md px-3 py-2 text-sm focus:outline-none"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
          <button
            onClick={handleSave}
            disabled={!testName.trim()}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all",
              !testName.trim() ? "cursor-not-allowed opacity-40" : "hover:brightness-110"
            )}
            style={{
              background: "var(--surface-3)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <Save size={14} />
            Save Test
          </button>
        </div>
      )}
    </div>
  );
}
