"""Tests for serial bridge (MockSerialBridge)."""

import asyncio
import time

import pytest

from accessware.backend.serial_bridge import MockSerialBridge


@pytest.fixture
def bridge():
    b = MockSerialBridge()
    asyncio.get_event_loop().run_until_complete(b.connect())
    return b


@pytest.mark.asyncio
async def test_send_move_returns_instantly():
    bridge = MockSerialBridge()
    await bridge.connect()
    start = time.monotonic()
    result = await bridge.send_move([120, 60, 90, 45], 15)
    elapsed = time.monotonic() - start
    # send_move should return in < 50ms (no sleep)
    assert elapsed < 0.05
    assert result == [90, 90, 90, 90]  # default starting angles


@pytest.mark.asyncio
async def test_wait_move_done_blocks():
    bridge = MockSerialBridge()
    await bridge.connect()
    await bridge.send_move([120, 60, 90, 45], 15)
    start = time.monotonic()
    await bridge.wait_move_done()
    elapsed = time.monotonic() - start
    # total_duration_ms(15) = 3000ms = 3s; should block for ~3s
    assert elapsed >= 2.5


@pytest.mark.asyncio
async def test_read_angles_returns_last():
    bridge = MockSerialBridge()
    await bridge.connect()
    initial = await bridge.read_angles()
    assert initial == [90, 90, 90, 90]
    await bridge.move([120, 60, 90, 45], 1)  # speed=1 -> 200ms
    final = await bridge.read_angles()
    assert final == [120, 60, 90, 45]


@pytest.mark.asyncio
async def test_move_convenience_blocks_full_duration():
    bridge = MockSerialBridge()
    await bridge.connect()
    start = time.monotonic()
    await bridge.move([120, 60, 90, 45], 10)  # 2000ms
    elapsed = time.monotonic() - start
    assert elapsed >= 1.5
    assert await bridge.read_angles() == [120, 60, 90, 45]
