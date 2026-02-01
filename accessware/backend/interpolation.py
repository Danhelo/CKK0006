"""Exact Python mirror of CokoinoArm::do_action() from CokoinoArm.cpp (lines 98-124).

Replicates the firmware's 180-tick linear interpolation including the edge-case
behaviour when target == current: the C++ ternary ``(T > S) ? S+1 : S-1``
evaluates to ``S-1`` when T == S (since T is NOT greater than S), so the servo
oscillates between ``current`` and ``current-1`` on every other tick for the
full 180 steps.

No external dependencies -- pure Python.
"""

from __future__ import annotations

from typing import Generator

TICK_COUNT = 180
"""Number of interpolation steps executed by the firmware do-while loop."""

HOLD_MULTIPLIER = 20
"""After the 180 ticks the firmware calls ``delay(speed * 20)``."""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _step_angle(target: int, current: int) -> int:
    """Single-tick angle update -- exact mirror of the C++ ternary.

    C++:  S_angle[i] = (T_angle[i] > S_angle[i]) ? S_angle[i]+1 : S_angle[i]-1;

    When target > current  -> current + 1  (moving toward target)
    When target < current  -> current - 1  (moving toward target)
    When target == current -> current - 1  (T is NOT > S, takes else branch)
    """
    if target > current:
        return current + 1
    return current - 1


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def total_duration_ms(speed: int) -> int:
    """Total wall-clock time of a ``do_action`` call.

    ``180 * speed`` for the tick loop, plus ``speed * 20`` for the trailing
    hold delay, giving ``speed * 200``.
    """
    return speed * TICK_COUNT + speed * HOLD_MULTIPLIER


def interpolate_poses(
    current: list[int],
    target: list[int],
    speed_ms: int,
) -> Generator[tuple[list[int], float], None, None]:
    """Yield ``(angles, elapsed_ms)`` for every tick of a ``do_action`` call.

    *current* and *target* are each 4-element lists of servo angles
    corresponding to [servo1, servo2, servo3, servo4].

    For each of the 180 ticks the generator yields the new 4-angle state and
    the cumulative elapsed time (the first yield is at ``speed_ms`` because
    the firmware delays *after* writing the servos in each iteration).

    After the 180 ticks a final yield represents the hold state at the full
    ``total_duration_ms``.

    Edge-case behaviour:
        When ``target[i] == current[i]`` the ternary evaluates to
        ``current - 1`` on odd ticks and back to ``current`` on even ticks,
        producing a 1-degree oscillation for the entire 180 steps.  This
        mirrors the firmware exactly.
    """
    if len(current) != 4 or len(target) != 4:
        raise ValueError("current and target must each have exactly 4 elements")

    s = list(current)  # mutable working copy (S_angle)
    t = list(target)   # target angles       (T_angle)

    for tick in range(1, TICK_COUNT + 1):
        for i in range(4):
            s[i] = _step_angle(t[i], s[i])
        yield list(s), tick * speed_ms

    # Trailing hold: delay(speed * 20)
    yield list(s), total_duration_ms(speed_ms)


def predict_angle_at_time(
    current: list[int],
    target: list[int],
    speed_ms: int,
    elapsed_ms: float,
) -> list[int]:
    """Compute the servo angles at an arbitrary point during a ``do_action``.

    *elapsed_ms* is clamped to ``[0, total_duration_ms]``.  Within the 180-tick
    window the tick index is ``min(int(elapsed_ms / speed_ms), 180)`` and the
    same ternary logic is applied iteratively for that many ticks.

    Returns a 4-element list of angles.
    """
    if len(current) != 4 or len(target) != 4:
        raise ValueError("current and target must each have exactly 4 elements")

    tick = min(int(elapsed_ms / speed_ms), TICK_COUNT) if speed_ms > 0 else TICK_COUNT
    if tick < 0:
        tick = 0

    s = list(current)
    t = list(target)

    for _ in range(tick):
        for i in range(4):
            s[i] = _step_angle(t[i], s[i])

    return s
