"""Tests for the test runner."""

import asyncio
from typing import Any

import pytest

from accessware.backend.serial_bridge import MockSerialBridge
from accessware.backend.test_runner import TestRunner, list_tests, load_test


@pytest.mark.asyncio
async def test_list_tests_finds_bundled():
    tests = list_tests()
    assert len(tests) >= 5
    assert all("id" in t for t in tests)
    assert all("name" in t for t in tests)
    ids = [t["id"] for t in tests]
    assert "grip-and-press" in ids


def test_load_test_by_filename():
    data = load_test("grip-and-press")
    assert data["name"] == "grip-and-press"
    assert "steps" in data


def test_load_test_by_json_name():
    """Fallback: load by JSON name field works."""
    data = load_test("grip-and-press")
    assert "steps" in data


def test_load_test_not_found():
    with pytest.raises(FileNotFoundError):
        load_test("nonexistent-test-xyz")


@pytest.mark.asyncio
async def test_runner_completes_with_mock_bridge():
    bridge = MockSerialBridge()
    await bridge.connect()

    messages: list[dict[str, Any]] = []

    async def capture(msg: dict[str, Any]) -> None:
        messages.append(msg)

    runner = TestRunner(bridge, on_state_change=capture)
    test_data = {
        "name": "mini-test",
        "speed": 1,  # speed=1 -> 200ms per step for fast tests
        "repeat_count": 1,
        "steps": [
            {"angles": [100, 80, 90, 90], "hold_ms": 0, "label": "step1"},
        ],
    }
    results = await runner.run_test(test_data)
    assert len(results) == 1
    assert results[0].test_name == "mini-test"
    assert len(results[0].steps) == 1


@pytest.mark.asyncio
async def test_predicted_angles_arrive_before_step_complete():
    """Regression: predicted_angles messages must arrive BEFORE step_complete."""
    bridge = MockSerialBridge()
    await bridge.connect()

    messages: list[dict[str, Any]] = []

    async def capture(msg: dict[str, Any]) -> None:
        messages.append(msg)

    runner = TestRunner(bridge, on_state_change=capture)
    test_data = {
        "name": "timing-test",
        "speed": 1,  # 200ms total
        "repeat_count": 1,
        "steps": [
            {"angles": [100, 80, 90, 90], "hold_ms": 0, "label": "move"},
        ],
    }
    await runner.run_test(test_data)

    types = [m.get("type") for m in messages]
    predicted_indices = [i for i, t in enumerate(types) if t == "predicted_angles"]
    step_complete_indices = [i for i, t in enumerate(types) if t == "step_complete"]

    assert len(predicted_indices) > 0, "Should have predicted_angles messages"
    assert len(step_complete_indices) > 0, "Should have step_complete messages"
    # All predicted_angles must come before the first step_complete
    assert max(predicted_indices) < min(step_complete_indices)
