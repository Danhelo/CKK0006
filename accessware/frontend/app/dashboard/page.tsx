"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard-header";
import { TestRunner } from "@/components/test-runner";
import { RecordMode } from "@/components/record-mode";
import { useTestRunner } from "@/hooks/use-test-runner";
import { useJoystickChoreography } from "@/components/arm-3d/use-joystick-choreography";
import { Layers, Radio, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

// R3F component needs ssr: false
const Arm3D = dynamic(
  () => import("@/components/arm-3d").then((m) => m.Arm3D),
  { ssr: false }
);

const ComparisonShowcase = dynamic(
  () => import("@/components/comparison-showcase").then((m) => m.ComparisonShowcase),
  { ssr: false }
);

export default function DashboardPage() {
  const runner = useTestRunner();
  const [activePanel, setActivePanel] = useState<"runner" | "record" | "compare">("runner");
  const showIdleDemo = runner.runState === "idle" && !runner.selectedTest;
  const choreography = useJoystickChoreography(showIdleDemo);

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--background)" }}>
      <DashboardHeader
        connected={runner.connected}
        presentationMode={runner.presentationMode}
        onTogglePresentation={runner.togglePresentationMode}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — 3D Visualization */}
        <div
          className="flex w-3/5 items-center justify-center border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <Arm3D
            angles={showIdleDemo ? choreography.armAngles : runner.predictedAngles}
            actualTrail={runner.actualTrail}
            designedTrail={runner.designedTrail}
            showDesigned={!!runner.testDefinition}
            showJoystick={showIdleDemo}
            joystickGlow={showIdleDemo ? choreography.joystickGlow : undefined}
            joystickEffect={showIdleDemo ? choreography.activeEffect : null}
          />
        </div>

        {/* Right panel — Controls */}
        <div className="flex w-2/5 flex-col" style={{ background: "var(--surface-1)" }}>
          {/* Panel tabs */}
          <div
            className="flex border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setActivePanel("runner")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-all",
              )}
              style={{
                color: activePanel === "runner" ? "var(--amber-400)" : "var(--text-tertiary)",
                borderBottom: activePanel === "runner" ? "2px solid var(--amber-400)" : "2px solid transparent",
                background: activePanel === "runner" ? "var(--amber-glow)" : "transparent",
              }}
            >
              <Radio size={12} />
              Test Runner
            </button>
            <button
              onClick={() => {
                setActivePanel("record");
                if (!runner.recordMode) runner.toggleRecordMode();
              }}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-all",
              )}
              style={{
                color: activePanel === "record" ? "var(--amber-400)" : "var(--text-tertiary)",
                borderBottom: activePanel === "record" ? "2px solid var(--amber-400)" : "2px solid transparent",
                background: activePanel === "record" ? "var(--amber-glow)" : "transparent",
              }}
            >
              <Layers size={12} />
              Record
            </button>
            <button
              onClick={() => setActivePanel("compare")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider transition-all",
              )}
              style={{
                color: activePanel === "compare" ? "var(--amber-400)" : "var(--text-tertiary)",
                borderBottom: activePanel === "compare" ? "2px solid var(--amber-400)" : "2px solid transparent",
                background: activePanel === "compare" ? "var(--amber-glow)" : "transparent",
              }}
            >
              <GitCompare size={12} />
              Compare
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-5">
            {activePanel === "runner" ? (
              <TestRunner
                tests={runner.tests}
                selectedTest={runner.selectedTest}
                testDefinition={runner.testDefinition}
                runState={runner.runState}
                currentStep={runner.currentStep}
                currentRepeat={runner.currentRepeat}
                currentLabel={runner.currentLabel}
                results={runner.results}
                onSelectTest={runner.selectTest}
                onRun={runner.runTest}
                onPause={runner.pause}
                onStop={runner.stop}
              />
            ) : activePanel === "record" ? (
              <RecordMode
                currentAngles={runner.currentAngles}
                capturedPoses={runner.capturedPoses}
                onJog={runner.jogTo}
                onCapture={runner.capturePose}
                onSave={runner.saveTest}
              />
            ) : (
              <ComparisonShowcase />
            )}
          </div>

          {/* Error bar */}
          {(runner.error || runner.wsError) && (
            <div
              className="px-4 py-2 text-xs font-medium"
              style={{ background: "var(--red-warm)", color: "#FFF" }}
            >
              {runner.error || runner.wsError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
