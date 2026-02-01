"""Tests for the interpolation module."""

from accessware.backend.interpolation import (
    ANGLE_MAX,
    ANGLE_MIN,
    TICK_COUNT,
    _clamp,
    _step_angle,
    interpolate_poses,
    predict_angle_at_time,
    total_duration_ms,
)


def test_total_duration_worst_case():
    # Without current/target: worst case = speed * 200
    assert total_duration_ms(10) == 2000
    assert total_duration_ms(15) == 3000
    assert total_duration_ms(1) == 200


def test_total_duration_with_positions():
    # Max distance is 30 degrees -> 30 ticks + 20 hold = 50 * speed
    assert total_duration_ms(10, [90, 90, 90, 90], [120, 60, 90, 90]) == 500
    # All already at target -> 0 ticks + 20 hold = 20 * speed
    assert total_duration_ms(10, [90, 90, 90, 90], [90, 90, 90, 90]) == 200


def test_clamp():
    assert _clamp(5) == ANGLE_MIN
    assert _clamp(180) == ANGLE_MAX
    assert _clamp(90) == 90
    assert _clamp(10) == 10
    assert _clamp(170) == 170


def test_step_angle_toward_target():
    assert _step_angle(100, 90) == 91   # moving up
    assert _step_angle(80, 90) == 89    # moving down


def test_step_angle_at_target():
    # No oscillation: hold still when at target
    assert _step_angle(90, 90) == 90


def test_interpolate_poses_reaches_target():
    """Servos reach exact target and stop (no oscillation)."""
    current = [90, 90, 90, 90]
    target = [120, 60, 100, 80]
    poses = list(interpolate_poses(current, target, 10))
    # Final pose before hold should be at target
    final_angles = poses[-1][0]
    assert final_angles == [120, 60, 100, 80]


def test_interpolate_poses_early_exit():
    """When max distance is 10 degrees, should exit after ~10 ticks (not 180)."""
    current = [90, 90, 90, 90]
    target = [100, 80, 95, 85]  # max distance = 10
    poses = list(interpolate_poses(current, target, 10))
    # 10 movement ticks + 1 hold = 11 yields (not 181)
    assert len(poses) == 11


def test_interpolate_poses_equal_angles_no_oscillation():
    """When target == current, no movement needed — exits immediately."""
    current = [90, 90, 90, 90]
    target = [90, 90, 90, 90]
    poses = list(interpolate_poses(current, target, 10))
    # 1 tick (detects all done) + 1 hold = 2 yields
    assert len(poses) == 2
    # Angles stay at 90 (no oscillation)
    assert poses[0][0] == [90, 90, 90, 90]
    assert poses[1][0] == [90, 90, 90, 90]


def test_interpolate_poses_clamping():
    """Target angles beyond safe range are clamped."""
    current = [90, 90, 90, 90]
    target = [0, 180, 5, 175]  # will be clamped to [10, 170, 10, 170]
    poses = list(interpolate_poses(current, target, 10))
    final_angles = poses[-1][0]
    assert final_angles == [10, 170, 10, 170]


def test_interpolate_poses_final_elapsed():
    """Final elapsed time accounts for early exit + hold."""
    speed = 10
    current = [90, 90, 90, 90]
    target = [100, 90, 90, 90]  # max distance = 10
    poses = list(interpolate_poses(current, target, speed))
    _, final_elapsed = poses[-1]
    # 10 ticks * 10ms + 20 * 10ms = 300ms
    assert final_elapsed == 300


def test_predict_angle_at_time_zero():
    result = predict_angle_at_time([90, 90, 90, 90], [120, 60, 90, 45], 10, 0)
    assert result == [90, 90, 90, 90]


def test_predict_angle_at_time_end():
    speed = 10
    result = predict_angle_at_time([90, 90, 90, 90], [120, 60, 100, 80], speed, 99999)
    # After enough ticks, all servos at (clamped) target
    assert result == [120, 60, 100, 80]


def test_predict_angle_at_time_midway():
    speed = 10
    # After 15 ticks (150ms), servo1 should be at 90+15=105
    result = predict_angle_at_time([90, 90, 90, 90], [120, 90, 90, 90], speed, 150)
    assert result[0] == 105
    # Other servos stay at 90 (target == current, no oscillation)
    assert result[1:] == [90, 90, 90]
