"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useWebSocket } from "./use-websocket";
import { API_BASE, SERVO_REST, PRESENTATION_DELAY_MS } from "@/lib/constants";
import { ARM_DIMENSIONS } from "@/lib/constants";
import type {
  Angles,
  TestListItem,
  TestDefinition,
  TestResult,
  RunState,
  CapturedPose,
  WsInMessage,
} from "@/lib/types";

export interface TestRunnerState {
  // Connection
  connected: boolean;
  wsError: string | null;
  // Tests
  tests: TestListItem[];
  selectedTest: string | null;
  testDefinition: TestDefinition | null;
  // Run state
  runState: RunState;
  currentStep: number;
  currentRepeat: number;
  currentLabel: string;
  // Angles
  predictedAngles: Angles;
  currentAngles: Angles;
  // Trails
  actualTrail: [number, number, number][];
  designedTrail: [number, number, number][];
  // Results
  results: TestResult[];
  // Record mode
  recordMode: boolean;
  capturedPoses: CapturedPose[];
  // Presentation
  presentationMode: boolean;
  // Error
  error: string | null;
}

export interface TestRunnerActions {
  fetchTests: () => Promise<void>;
  selectTest: (name: string) => Promise<void>;
  runTest: () => void;
  pause: () => void;
  stop: () => void;
  jogTo: (angles: Angles) => void;
  capturePose: (label: string) => void;
  saveTest: (name: string, description: string) => Promise<void>;
  toggleRecordMode: () => void;
  togglePresentationMode: () => void;
  clearTrails: () => void;
}

/** Forward kinematics: convert servo angles to 3D gripper tip position */
function computeGripperTip(angles: Angles): [number, number, number] {
  const { baseHeight, segment1Length, segment2Length, gripperLength } = ARM_DIMENSIONS;
  const [s1, s2, s3] = angles;

  // Convert degrees to radians
  const baseAngle = ((s1 - 90) * Math.PI) / 180;
  const shoulder = ((s2 - 90) * Math.PI) / 180;
  const elbow = (-(s3 - 90) * Math.PI) / 180;

  // 2D arm kinematics in the vertical plane
  const seg1EndY = baseHeight + segment1Length * Math.cos(shoulder);
  const seg1EndH = segment1Length * Math.sin(shoulder);

  const totalElbow = shoulder + elbow;
  const seg2EndY = seg1EndY + segment2Length * Math.cos(totalElbow);
  const seg2EndH = seg1EndH + segment2Length * Math.sin(totalElbow);

  const tipY = seg2EndY + gripperLength * Math.cos(totalElbow);
  const tipH = seg2EndH + gripperLength * Math.sin(totalElbow);

  // Rotate horizontal distance around Y axis by base angle
  const tipX = tipH * Math.sin(baseAngle);
  const tipZ = tipH * Math.cos(baseAngle);

  return [tipX, tipY, tipZ];
}

export function useTestRunner(): TestRunnerState & TestRunnerActions {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [testDefinition, setTestDefinition] = useState<TestDefinition | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("");
  const [predictedAngles, setPredictedAngles] = useState<Angles>(SERVO_REST);
  const [currentAngles, setCurrentAngles] = useState<Angles>(SERVO_REST);
  const [actualTrail, setActualTrail] = useState<[number, number, number][]>([]);
  const [designedTrail, setDesignedTrail] = useState<[number, number, number][]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [recordMode, setRecordMode] = useState(false);
  const [capturedPoses, setCapturedPoses] = useState<CapturedPose[]>([]);
  const [presentationMode, setPresentationMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presentationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const testsRef = useRef(tests);
  const selectedTestRef = useRef(selectedTest);
  testsRef.current = tests;
  selectedTestRef.current = selectedTest;

  const handleMessage = useCallback((msg: WsInMessage) => {
    switch (msg.type) {
      case "state": {
        if (msg.state) setRunState(msg.state);
        if (msg.step !== undefined) setCurrentStep(msg.step);
        if (msg.repeat !== undefined) setCurrentRepeat(msg.repeat);
        if (msg.label) setCurrentLabel(msg.label);
        if (msg.predicted_angles) {
          setPredictedAngles(msg.predicted_angles);
          const tip = computeGripperTip(msg.predicted_angles);
          setActualTrail((prev) => [...prev, tip]);
        }
        if (msg.target) {
          setPredictedAngles(msg.target);
        }
        break;
      }
      case "predicted_angles": {
        const pa = msg.angles as Angles;
        if (pa) {
          setPredictedAngles(pa);
          const tip = computeGripperTip(pa);
          setActualTrail((prev) => [...prev, tip]);
        }
        break;
      }
      case "angles":
        setCurrentAngles(msg.angles);
        break;
      case "step_complete":
        setCurrentStep(msg.step);
        setCurrentRepeat(msg.repeat);
        break;
      case "test_complete":
        setRunState(msg.state === "stopped" ? "stopped" : "complete");
        setResults(msg.results);
        break;
      case "error":
        setError(msg.message);
        break;
    }
  }, []);

  const { connected, send, error: wsError } = useWebSocket({
    onMessage: handleMessage,
  });

  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tests`);
      if (!res.ok) throw new Error("Failed to fetch tests");
      const data: TestListItem[] = await res.json();
      setTests(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch tests");
    }
  }, []);

  const selectTest = useCallback(async (name: string) => {
    setSelectedTest(name);
    setResults([]);
    setActualTrail([]);
    setRunState("idle");
    try {
      const res = await fetch(`${API_BASE}/tests/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Failed to fetch test definition");
      const data: TestDefinition = await res.json();
      setTestDefinition(data);
      // Compute designed trail from designed_path
      if (data.designed_path) {
        const trail = data.designed_path.map((a) => computeGripperTip(a));
        setDesignedTrail(trail);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch test");
    }
  }, []);

  const runTest = useCallback(() => {
    if (!selectedTest) return;
    setRunState("running");
    setResults([]);
    setActualTrail([]);
    setCurrentStep(0);
    setCurrentRepeat(0);
    send({ type: "run_test", name: selectedTest });
  }, [selectedTest, send]);

  const pause = useCallback(() => {
    send({ type: "pause" });
  }, [send]);

  const stop = useCallback(() => {
    send({ type: "stop" });
  }, [send]);

  const jogTo = useCallback(
    (angles: Angles) => {
      send({ type: "jog", angles });
      setPredictedAngles(angles);
    },
    [send]
  );

  const capturePose = useCallback(
    (label: string) => {
      setCapturedPoses((prev) => [...prev, { label, angles: [...predictedAngles] as Angles }]);
    },
    [predictedAngles]
  );

  const saveTest = useCallback(
    async (name: string, description: string) => {
      try {
        const body: TestDefinition = {
          name,
          description,
          designed_path: capturedPoses.map((p) => p.angles),
          steps: capturedPoses.map((p) => ({
            angles: p.angles,
            hold_ms: 500,
            label: p.label,
          })),
          speed: 15,
          repeat_count: 1,
        };
        const res = await fetch(`${API_BASE}/tests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to save test");
        setCapturedPoses([]);
        await fetchTests();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save test");
      }
    },
    [capturedPoses, fetchTests]
  );

  const toggleRecordMode = useCallback(() => {
    setRecordMode((prev) => !prev);
  }, []);

  const togglePresentationMode = useCallback(() => {
    setPresentationMode((prev) => !prev);
  }, []);

  const clearTrails = useCallback(() => {
    setActualTrail([]);
  }, []);

  // Presentation loop: auto-advance to next test after completion
  useEffect(() => {
    if (!presentationMode || runState !== "complete") return;

    presentationTimerRef.current = setTimeout(() => {
      const currentTests = testsRef.current;
      const currentSelected = selectedTestRef.current;
      if (currentTests.length === 0) return;

      const currentIndex = currentTests.findIndex((t) => t.name === currentSelected);
      const nextIndex = (currentIndex + 1) % currentTests.length;
      const nextTest = currentTests[nextIndex];

      // Select and auto-run next test
      selectTest(nextTest.name).then(() => {
        // Small delay to let state settle before running
        setTimeout(() => {
          send({ type: "run_test", name: nextTest.name });
          setRunState("running");
          setResults([]);
          setActualTrail([]);
          setCurrentStep(0);
          setCurrentRepeat(0);
        }, 500);
      });
    }, PRESENTATION_DELAY_MS);

    return () => {
      if (presentationTimerRef.current) {
        clearTimeout(presentationTimerRef.current);
      }
    };
  }, [presentationMode, runState, selectTest, send]);

  // Fetch tests on mount
  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  return {
    connected,
    wsError,
    tests,
    selectedTest,
    testDefinition,
    runState,
    currentStep,
    currentRepeat,
    currentLabel,
    predictedAngles,
    currentAngles,
    actualTrail,
    designedTrail,
    results,
    recordMode,
    capturedPoses,
    presentationMode,
    error,
    fetchTests,
    selectTest,
    runTest,
    pause,
    stop,
    jogTo,
    capturePose,
    saveTest,
    toggleRecordMode,
    togglePresentationMode,
    clearTrails,
  };
}
