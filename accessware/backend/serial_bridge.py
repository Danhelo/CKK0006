"""Serial bridge to communicate with the CKK0006 robotic arm over USB.

Sends MOVE/READ commands and receives ACK/DONE/READY responses using the
protocol defined in Sketches/serial_control/serial_control.ino.

Provides both a real SerialBridge (pyserial) and a MockSerialBridge for
development without hardware.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Protocol

logger = logging.getLogger(__name__)

DEFAULT_PORT = "/dev/cu.usbserial-2110"
DEFAULT_BAUD = 9600
READ_TIMEOUT = 5.0  # seconds — accounts for blocking MOVE (~3 s at speed 15)
READY_TIMEOUT = 5.0  # seconds — CH340 reset delay on connect


class BridgeProtocol(Protocol):
    """Interface shared by real and mock bridges."""

    async def connect(self) -> None: ...
    async def disconnect(self) -> None: ...
    async def send_move(self, angles: list[int], speed: int) -> list[int]: ...
    async def wait_move_done(self) -> None: ...
    async def move(self, angles: list[int], speed: int) -> list[int]: ...
    async def read_angles(self) -> list[int]: ...
    @property
    def connected(self) -> bool: ...


# ---------------------------------------------------------------------------
# Real serial bridge
# ---------------------------------------------------------------------------

class SerialBridge:
    """Communicates with the Arduino over a physical serial port."""

    def __init__(self, port: str = DEFAULT_PORT, baud: int = DEFAULT_BAUD) -> None:
        self._port = port
        self._baud = baud
        self._serial = None  # type: ignore[assignment]
        self._connected = False

    @property
    def connected(self) -> bool:
        return self._connected

    # -- blocking helpers (run via asyncio.to_thread) ----------------------

    def _open(self) -> None:
        import serial  # type: ignore[import-untyped]
        self._serial = serial.Serial(self._port, self._baud, timeout=READ_TIMEOUT)

    def _wait_ready(self) -> None:
        deadline = time.monotonic() + READY_TIMEOUT
        while time.monotonic() < deadline:
            line = self._serial.readline().decode("ascii", errors="replace").strip()
            if line == "READY":
                return
        raise TimeoutError("Did not receive READY from Arduino")

    def _send(self, cmd: str) -> None:
        self._serial.write((cmd + "\n").encode("ascii"))
        self._serial.flush()

    def _readline(self) -> str:
        raw = self._serial.readline()
        return raw.decode("ascii", errors="replace").strip()

    def _send_move_cmd(self, angles: list[int], speed: int) -> list[int]:
        """Send MOVE command, read ACK, return immediately (no DONE wait)."""
        cmd = f"MOVE,{angles[0]},{angles[1]},{angles[2]},{angles[3]},{speed}"
        self._send(cmd)
        ack = self._readline()  # ACK,a1,a2,a3,a4
        return _parse_ack(ack)

    def _wait_done(self) -> None:
        """Block until DONE is received from the Arduino."""
        done = self._readline()
        if done != "DONE":
            logger.warning("Expected DONE, got: %s", done)

    def _send_read(self) -> list[int]:
        self._send("READ")
        ack = self._readline()
        return _parse_ack(ack)

    # -- async public API --------------------------------------------------

    async def connect(self) -> None:
        await asyncio.to_thread(self._open)
        await asyncio.to_thread(self._wait_ready)
        self._connected = True
        logger.info("Connected to %s", self._port)

    async def disconnect(self) -> None:
        if self._serial:
            self._serial.close()
        self._connected = False
        logger.info("Disconnected from %s", self._port)

    async def send_move(self, angles: list[int], speed: int) -> list[int]:
        return await asyncio.to_thread(self._send_move_cmd, angles, speed)

    async def wait_move_done(self) -> None:
        await asyncio.to_thread(self._wait_done)

    async def move(self, angles: list[int], speed: int) -> list[int]:
        result = await self.send_move(angles, speed)
        await self.wait_move_done()
        return result

    async def read_angles(self) -> list[int]:
        return await asyncio.to_thread(self._send_read)


# ---------------------------------------------------------------------------
# Mock bridge (no hardware required)
# ---------------------------------------------------------------------------

class MockSerialBridge:
    """Simulates the serial protocol for development without an Arduino."""

    def __init__(self) -> None:
        self._angles = [90, 90, 90, 90]
        self._connected = False
        self._target: list[int] | None = None
        self._move_start: float = 0.0
        self._move_duration: float = 0.0

    @property
    def connected(self) -> bool:
        return self._connected

    async def connect(self) -> None:
        self._connected = True
        logger.info("MockSerialBridge connected (no hardware)")

    async def disconnect(self) -> None:
        self._connected = False

    async def send_move(self, angles: list[int], speed: int) -> list[int]:
        from .interpolation import total_duration_ms
        before = list(self._angles)
        self._target = list(angles)
        self._move_start = time.monotonic()
        self._move_duration = total_duration_ms(speed) / 1000.0
        return before

    async def wait_move_done(self) -> None:
        if self._target is None:
            return
        remaining = self._move_duration - (time.monotonic() - self._move_start)
        if remaining > 0:
            await asyncio.sleep(remaining)
        self._angles = list(self._target)
        self._target = None

    async def move(self, angles: list[int], speed: int) -> list[int]:
        result = await self.send_move(angles, speed)
        await self.wait_move_done()
        return result

    async def read_angles(self) -> list[int]:
        return list(self._angles)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_ack(line: str) -> list[int]:
    """Parse ``ACK,a1,a2,a3,a4`` into a list of 4 ints."""
    if not line.startswith("ACK,"):
        raise ValueError(f"Expected ACK response, got: {line!r}")
    parts = line[4:].split(",")
    if len(parts) != 4:
        raise ValueError(f"ACK must have 4 values, got: {line!r}")
    return [int(p) for p in parts]
