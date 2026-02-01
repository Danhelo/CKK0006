"""Python mirror of CokoinoArm::do_action() from CokoinoArm.cpp.

Replicates the firmware's linear interpolation with early exit:
- Each tick, servos that haven't reached their target move 1 degree closer.
- Servos already at target hold still (no oscillation).
- When all 4 servos reach their targets, the loop exits early.
- After the movement ticks, a hold delay of speed*20 is applied.

Angles are clamped to [ANGLE_MIN, ANGLE_MAX] (safe mechanical range).

No external dependencies -- pure Python.
"""

from __future__ import annotations

from typing import Generator

TICK_COUNT = 180
"""Maximum number of interpolation steps in the firmware do-while loop."""

HOLD_MULTIPLIER = 20
"""After movement ticks the firmware calls ``delay(speed * 20)``."""

ANGLE_MIN = 10
"""Minimum safe servo angle (firmware clamps to this)."""

ANGLE_MAX = 170
"""Maximum safe servo angle (firmware clamps to this)."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clamp(value: int, lo: int = ANGLE_MIN, hi: int = ANGLE_MAX) -> int:
    """Clamp an angle to the safe mechanical range."""
    return max(lo, min(hi, value))


def _step_angle(target: int, current: int) -> int:
    """Single-tick angle update -- mirrors the fixed firmware.

    When target > current  -> current + 1  (moving toward target)
    When target < current  -> current - 1  (moving toward target)
    When target == current -> current       (hold still, no oscillation)
    """
    if target > current:
        return current + 1
    elif target < current:
        return current - 1
    return current


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def total_duration_ms(speed: int, current: list[int] | None = None, target: list[int] | None = None) -> int:
    """Total wall-clock time of a ``do_action`` call.

    With the early-exit firmware, duration depends on the max distance any
    servo needs to travel. If current/target are provided, returns the actual
    duration. Otherwise returns the worst-case (180 ticks + hold).
    """
    if current is not None and target is not None:
        max_dist = max(abs(_clamp(t) - c) for c, t in zip(current, target))
        ticks = min(max_dist, TICK_COUNT)
    else:
        ticks = TICK_COUNT
    return speed * ticks + speed * HOLD_MULTIPLIER


def interpolate_poses(
    current: list[int],
    target: list[int],
    speed_ms: int,
) -> Generator[tuple[list[int], float], None, None]:
    """Yield ``(angles, elapsed_ms)`` for every tick of a ``do_action`` call.

    *current* and *target* are each 4-element lists of servo angles.
    Target angles are clamped to [ANGLE_MIN, ANGLE_MAX] to match firmware.

    For each tick the generator yields the new 4-angle state and the
    cumulative elapsed time. The loop exits early when all servos have
    reached their targets (matching the firmware's early-exit behavior).

    A final yield represents the hold state after movement completes.
    """
    if len(current) != 4 or len(target) != 4:
        raise ValueError("current and target must each have exactly 4 elements")

    s = list(current)  # mutable working copy (S_angle)
    t = [_clamp(a) for a in target]  # clamped target angles (T_angle)

    for tick in range(1, TICK_COUNT + 1):
        done_count = 0
        for i in range(4):
            s[i] = _step_angle(t[i], s[i])
            if s[i] == t[i]:
                done_count += 1
        yield list(s), tick * speed_ms
        # Early exit: all servos reached target
        if done_count == 4:
            break

    # Trailing hold: delay(speed * 20)
    hold_elapsed = speed_ms * HOLD_MULTIPLIER
    last_tick_elapsed = tick * speed_ms  # noqa: F821 — tick is set by the loop
    yield list(s), last_tick_elapsed + hold_elapsed


def predict_angle_at_time(
    current: list[int],
    target: list[int],
    speed_ms: int,
    elapsed_ms: float,
) -> list[int]:
    """Compute the servo angles at an arbitrary point during a ``do_action``.

    *elapsed_ms* is clamped to ``[0, total_duration_ms]``.  Within the tick
    window the tick index is ``min(int(elapsed_ms / speed_ms), TICK_COUNT)``
    and the step logic is applied iteratively.

    Returns a 4-element list of angles.
    """
    if len(current) != 4 or len(target) != 4:
        raise ValueError("current and target must each have exactly 4 elements")

    tick = min(int(elapsed_ms / speed_ms), TICK_COUNT) if speed_ms > 0 else TICK_COUNT
    if tick < 0:
        tick = 0

    s = list(current)
    t = [_clamp(a) for a in target]

    for _ in range(tick):
        all_done = True
        for i in range(4):
            s[i] = _step_angle(t[i], s[i])
            if s[i] != t[i]:
                all_done = False
        if all_done:
            break

    return s
