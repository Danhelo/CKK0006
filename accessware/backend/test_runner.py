"""Test execution engine for Accessware.

Loads test JSON files, executes steps via the serial bridge, streams
predicted angles through an on_state_change callback, and computes
result metrics after each run.
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
import os
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Coroutine

from .interpolation import interpolate_poses, total_duration_ms
from .serial_bridge import BridgeProtocol

logger = logging.getLogger(__name__)

BUNDLED_DIR = Path(__file__).resolve().parent.parent / "tests" / "bundled"
CUSTOM_DIR = Path(__file__).resolve().parent.parent / "tests" / "custom"


class RunState(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    COMPLETE = "complete"


@dataclass
class StepResult:
    label: str
    target_angles: list[int]
    actual_start_angles: list[int]
    actual_end_angles: list[int]
    planned_duration_ms: int
    actual_duration_ms: float
    hold_ms: int


@dataclass
class TestResult:
    test_name: str
    repeat_index: int
    steps: list[StepResult] = field(default_factory=list)
    range_coverage: dict[str, float] = field(default_factory=dict)
    repeatability: float = 0.0
    total_time_ms: float = 0.0
    path_divergence: float = 0.0
    ergonomic_flags: list[str] = field(default_factory=list)
    verdict: str = "pass"


# ---- Callback type alias ----
StateCallback = Callable[[dict[str, Any]], Coroutine[Any, Any, None]]


# ---------------------------------------------------------------------------
# Test loading
# ---------------------------------------------------------------------------

def list_tests() -> list[dict[str, str]]:
    """Return metadata for all available tests (bundled + custom)."""
    tests: list[dict[str, str]] = []
    for directory, source in [(BUNDLED_DIR, "bundled"), (CUSTOM_DIR, "custom")]:
        if not directory.exists():
            continue
        for f in sorted(directory.glob("*.json")):
            try:
                data = json.loads(f.read_text())
                tests.append({
                    "id": f.stem,
                    "name": data.get("name", f.stem),
                    "description": data.get("description", ""),
                    "source": source,
                    "file": str(f),
                })
            except (json.JSONDecodeError, KeyError):
                logger.warning("Skipping invalid test file: %s", f)
    return tests


def load_test(name: str) -> dict[str, Any]:
    """Load a test by filename stem or JSON name field."""
    # Try direct filename match first
    for directory in [BUNDLED_DIR, CUSTOM_DIR]:
        path = directory / f"{name}.json"
        if path.exists():
            return json.loads(path.read_text())
    # Fallback: search by JSON "name" field
    for directory in [BUNDLED_DIR, CUSTOM_DIR]:
        if not directory.exists():
            continue
        for f in directory.glob("*.json"):
            try:
                data = json.loads(f.read_text())
                if data.get("name") == name:
                    return data
            except (json.JSONDecodeError, KeyError):
                continue
    raise FileNotFoundError(f"Test not found: {name}")


def save_test(data: dict[str, Any]) -> Path:
    """Save a new test to the custom directory."""
    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
    name = data.get("name", "untitled")
    path = CUSTOM_DIR / f"{name}.json"
    path.write_text(json.dumps(data, indent=2))
    return path


# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------

class TestRunner:
    """Executes test sequences on the robotic arm."""

    def __init__(self, bridge: BridgeProtocol, on_state_change: StateCallback | None = None) -> None:
        self._bridge = bridge
        self._on_state_change = on_state_change
        self._state = RunState.IDLE
        self._cancel = False
        self._pause_event = asyncio.Event()
        self._pause_event.set()  # not paused initially

    @property
    def state(self) -> RunState:
        return self._state

    async def _emit(self, msg: dict[str, Any]) -> None:
        if self._on_state_change:
            try:
                await self._on_state_change(msg)
            except Exception:
                logger.exception("State callback error")

    def pause(self) -> None:
        self._pause_event.clear()
        self._state = RunState.PAUSED

    def resume(self) -> None:
        self._pause_event.set()
        self._state = RunState.RUNNING

    def stop(self) -> None:
        self._cancel = True
        self._pause_event.set()  # unblock if paused

    async def run_test(self, test_data: dict[str, Any]) -> list[TestResult]:
        """Execute a full test (all repeats). Returns results per repeat."""
        self._state = RunState.RUNNING
        self._cancel = False
        self._pause_event.set()

        speed = test_data.get("speed", 15)
        repeat_count = test_data.get("repeat_count", 1)
        steps = test_data["steps"]
        all_results: list[TestResult] = []

        await self._emit({"type": "state", "state": "running", "test": test_data["name"]})

        for repeat_idx in range(repeat_count):
            if self._cancel:
                break

            result = TestResult(test_name=test_data["name"], repeat_index=repeat_idx)
            run_start = time.monotonic()

            # Read starting angles
            current_angles = await self._bridge.read_angles()

            for step_idx, step in enumerate(steps):
                if self._cancel:
                    break

                await self._pause_event.wait()

                target = step["angles"]
                hold_ms = step.get("hold_ms", 0)
                label = step.get("label", f"step {step_idx}")

                await self._emit({
                    "type": "state",
                    "state": "running",
                    "repeat": repeat_idx,
                    "step": step_idx,
                    "label": label,
                    "target": target,
                    "speed": speed,
                })

                step_start = time.monotonic()

                # Send MOVE command (returns immediately after ACK)
                start_angles = await self._bridge.send_move(target, speed)

                # Stream predicted angles in real-time while firmware moves
                move_duration = total_duration_ms(speed)
                stream_start = time.monotonic()
                for angles, elapsed in interpolate_poses(current_angles, target, speed):
                    if self._cancel:
                        break
                    real_elapsed = (time.monotonic() - stream_start) * 1000
                    sleep_needed = (elapsed - real_elapsed) / 1000.0
                    if sleep_needed > 0:
                        await asyncio.sleep(sleep_needed)
                    await self._emit({
                        "type": "predicted_angles",
                        "angles": angles,
                        "elapsed_ms": elapsed,
                        "step": step_idx,
                        "repeat": repeat_idx,
                    })

                # Wait for firmware to confirm movement complete
                await self._bridge.wait_move_done()

                # Hold period
                if hold_ms > 0 and not self._cancel:
                    await asyncio.sleep(hold_ms / 1000.0)

                step_end = time.monotonic()
                end_angles = await self._bridge.read_angles()

                result.steps.append(StepResult(
                    label=label,
                    target_angles=target,
                    actual_start_angles=start_angles,
                    actual_end_angles=end_angles,
                    planned_duration_ms=move_duration + hold_ms,
                    actual_duration_ms=(step_end - step_start) * 1000,
                    hold_ms=hold_ms,
                ))

                await self._emit({"type": "step_complete", "step": step_idx, "repeat": repeat_idx})

                current_angles = end_angles

            result.total_time_ms = (time.monotonic() - run_start) * 1000
            _compute_metrics(result, test_data)
            all_results.append(result)

        # Compute cross-run repeatability and assign to each result
        rep_score = compute_repeatability(all_results)
        for r in all_results:
            r.repeatability = rep_score

        self._state = RunState.STOPPED if self._cancel else RunState.COMPLETE
        await self._emit({
            "type": "test_complete",
            "state": self._state.value,
            "results": [_result_to_dict(r) for r in all_results],
        })

        return all_results


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def _compute_metrics(result: TestResult, test_data: dict[str, Any]) -> None:
    """Fill in range_coverage, ergonomic_flags, path_divergence, verdict."""
    if not result.steps:
        return

    # Range coverage: per servo, what % of 0-180 was used
    servo_mins = [180] * 4
    servo_maxs = [0] * 4
    prev_angles: list[int] | None = None
    reversals = 0

    for s in result.steps:
        for i in range(4):
            servo_mins[i] = min(servo_mins[i], s.target_angles[i])
            servo_maxs[i] = max(servo_maxs[i], s.target_angles[i])
        # Ergonomic: sharp direction reversals
        if prev_angles is not None:
            for i in range(4):
                delta = s.target_angles[i] - prev_angles[i]
                if prev_angles != result.steps[0].target_angles:
                    prev_delta = prev_angles[i] - result.steps[max(0, result.steps.index(s) - 2)].target_angles[i]
                    if delta != 0 and prev_delta != 0 and (delta > 0) != (prev_delta > 0):
                        reversals += 1
        prev_angles = s.target_angles

    for i in range(4):
        span = servo_maxs[i] - servo_mins[i]
        result.range_coverage[f"servo{i+1}"] = round(span / 180.0 * 100, 1)

    # Ergonomic flags
    if reversals > 4:
        result.ergonomic_flags.append(f"sharp_reversals:{reversals}")

    for s in result.steps:
        if s.hold_ms >= 3000:
            for i in range(4):
                if s.target_angles[i] < 20 or s.target_angles[i] > 160:
                    result.ergonomic_flags.append(f"extreme_hold:{s.label}")
                    break

    # Path divergence against designed_path
    designed = test_data.get("designed_path", [])
    actual_path = [s.target_angles for s in result.steps]
    if designed and actual_path:
        total_dev = 0.0
        comparisons = min(len(designed), len(actual_path))
        for i in range(comparisons):
            for j in range(4):
                total_dev += abs(designed[i][j] - actual_path[i][j])
        max_possible = comparisons * 4 * 180
        result.path_divergence = round(total_dev / max_possible * 100, 2) if max_possible > 0 else 0.0

    # Timing drift
    timing_drifts = []
    for s in result.steps:
        if s.planned_duration_ms > 0:
            drift = abs(s.actual_duration_ms - s.planned_duration_ms) / s.planned_duration_ms
            timing_drifts.append(drift)

    # Verdict
    if result.ergonomic_flags:
        result.verdict = "warning"
    if result.path_divergence > 10:
        result.verdict = "fail"
    if any(d > 0.2 for d in timing_drifts):
        result.verdict = "warning" if result.verdict == "pass" else result.verdict


def compute_repeatability(results: list[TestResult]) -> float:
    """Variance across repeated runs (lower = more consistent)."""
    if len(results) < 2:
        return 0.0

    # Compare final angles of each step across runs
    deviations: list[float] = []
    step_count = min(len(r.steps) for r in results)
    for step_idx in range(step_count):
        for servo_idx in range(4):
            values = [r.steps[step_idx].actual_end_angles[servo_idx] for r in results]
            mean = sum(values) / len(values)
            variance = sum((v - mean) ** 2 for v in values) / len(values)
            deviations.append(math.sqrt(variance))

    return round(sum(deviations) / len(deviations), 2) if deviations else 0.0


def _result_to_dict(result: TestResult) -> dict[str, Any]:
    """Serialize a TestResult for JSON/WebSocket transport."""
    return {
        "test_name": result.test_name,
        "repeat_index": result.repeat_index,
        "steps": [
            {
                "label": s.label,
                "target_angles": s.target_angles,
                "actual_start_angles": s.actual_start_angles,
                "actual_end_angles": s.actual_end_angles,
                "planned_duration_ms": s.planned_duration_ms,
                "actual_duration_ms": round(s.actual_duration_ms, 1),
                "hold_ms": s.hold_ms,
            }
            for s in result.steps
        ],
        "range_coverage": result.range_coverage,
        "repeatability": result.repeatability,
        "total_time_ms": round(result.total_time_ms, 1),
        "path_divergence": result.path_divergence,
        "ergonomic_flags": result.ergonomic_flags,
        "verdict": result.verdict,
    }
