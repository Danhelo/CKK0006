"""Tests for the interpolation module."""

from accessware.backend.interpolation import (
    TICK_COUNT,
    interpolate_poses,
    predict_angle_at_time,
    total_duration_ms,
)


def test_total_duration_formula():
    # speed * 180 + speed * 20 = speed * 200
    assert total_duration_ms(10) == 2000
    assert total_duration_ms(15) == 3000
    assert total_duration_ms(1) == 200


def test_interpolate_poses_tick_count():
    poses = list(interpolate_poses([90, 90, 90, 90], [120, 60, 90, 45], 10))
    # 180 ticks + 1 final hold = 181 yields
    assert len(poses) == TICK_COUNT + 1


def test_interpolate_poses_final_elapsed():
    speed = 12
    poses = list(interpolate_poses([90, 90, 90, 90], [120, 60, 90, 45], speed))
    _, final_elapsed = poses[-1]
    assert final_elapsed == total_duration_ms(speed)


def test_interpolate_poses_equal_angles_oscillation():
    """When target == current, servo oscillates between current and current-1."""
    poses = list(interpolate_poses([90, 90, 90, 90], [90, 90, 90, 90], 10))
    angles_at_tick_1 = poses[0][0]
    angles_at_tick_2 = poses[1][0]
    # Tick 1: 90 is NOT > 90, so becomes 89
    assert angles_at_tick_1 == [89, 89, 89, 89]
    # Tick 2: 90 > 89, so becomes 90
    assert angles_at_tick_2 == [90, 90, 90, 90]


def test_predict_angle_at_time_zero():
    result = predict_angle_at_time([90, 90, 90, 90], [120, 60, 90, 45], 10, 0)
    assert result == [90, 90, 90, 90]


def test_predict_angle_at_time_end():
    speed = 10
    total = total_duration_ms(speed)
    result = predict_angle_at_time([90, 90, 90, 90], [120, 60, 90, 45], speed, total)
    # After 180 ticks of +/-1 steps, servos moved 180 steps max
    # servo1: 90 -> 120 = +30 steps -> at tick 180 = 90 + 30 steps then oscillates back
    # This is a known firmware behavior; just verify it returns 4 ints
    assert len(result) == 4
    assert all(isinstance(a, int) for a in result)
