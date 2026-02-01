#!/usr/bin/env python3
"""Standalone serial probe for the CKK0006 robotic arm.

Tests the CH340 USB-to-serial connection to the Arduino Nano independently
of the full Accessware stack. Run this script to verify:

  1. CH340 driver is installed and the port is accessible
  2. The Nano is responding (reads boot messages)
  3. TX path works (sends a READ command)

Usage:
    python -m accessware.backend.serial_probe
    # or directly:
    python accessware/backend/serial_probe.py
"""

from __future__ import annotations

import sys
import time

DEFAULT_PORT = "/dev/cu.usbserial-2110"
DEFAULT_BAUD = 9600
BOOT_TIMEOUT = 5.0  # seconds to wait for boot messages


def probe(port: str = DEFAULT_PORT, baud: int = DEFAULT_BAUD) -> None:
    # -- Check if pyserial is available --
    try:
        import serial  # type: ignore[import-untyped]
        import serial.tools.list_ports  # type: ignore[import-untyped]
    except ImportError:
        print("ERROR: pyserial not installed. Run: pip install pyserial")
        sys.exit(1)

    # -- List available serial ports --
    print("=== Available serial ports ===")
    ports = list(serial.tools.list_ports.comports())
    if not ports:
        print("  (none found)")
    for p in ports:
        marker = " <-- target" if p.device == port else ""
        print(f"  {p.device}  [{p.description}]{marker}")
    print()

    # -- Check if target port exists --
    port_devices = [p.device for p in ports]
    if port not in port_devices:
        print(f"ERROR: Target port {port} not found.")
        print("Check that:")
        print("  1. The Arduino Nano is plugged in via USB")
        print("  2. The CH340 driver is installed (see CH340 Driver/ folder)")
        print("  3. No other program has the port open (Arduino IDE, screen, etc.)")
        sys.exit(1)

    # -- Open serial connection --
    print(f"Opening {port} at {baud} baud...")
    try:
        ser = serial.Serial(port, baud, timeout=1.0)
    except serial.SerialException as e:
        print(f"ERROR: Could not open port: {e}")
        sys.exit(1)

    print("Port opened. Waiting for boot messages...\n")

    # -- Read boot messages --
    print("=== Boot messages (waiting up to {:.0f}s) ===".format(BOOT_TIMEOUT))
    deadline = time.monotonic() + BOOT_TIMEOUT
    lines_read = 0
    while time.monotonic() < deadline:
        raw = ser.readline()
        if raw:
            line = raw.decode("ascii", errors="replace").strip()
            if line:
                print(f"  RX: {line}")
                lines_read += 1

    if lines_read == 0:
        print("  (no boot messages received)")
        print("  This is expected if the Nano already booted before connection.")
    print()

    # -- Send READ command --
    print("=== Sending READ command ===")
    ser.write(b"READ\n")
    ser.flush()
    print("  TX: READ")

    # Wait for response
    time.sleep(0.5)
    response = ser.readline()
    if response:
        line = response.decode("ascii", errors="replace").strip()
        print(f"  RX: {line}")
        if line.startswith("ACK,"):
            parts = line[4:].split(",")
            print(f"  Parsed angles: {parts}")
            print("  Serial communication WORKING")
        else:
            print(f"  Unexpected response (firmware may not support READ)")
    else:
        print("  (no response — expected if calibration firmware is flashed)")
    print()

    # -- Summary --
    print("=== Summary ===")
    print(f"  Port:       {port}")
    print(f"  Baud:       {baud}")
    print(f"  CH340:      OK (port opened successfully)")
    print(f"  Boot msgs:  {lines_read} line(s)")
    print(f"  TX path:    sent READ command")

    ser.close()
    print("\nProbe complete. Port closed.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Probe CH340 serial connection to Arduino Nano")
    parser.add_argument("--port", default=DEFAULT_PORT, help=f"Serial port (default: {DEFAULT_PORT})")
    parser.add_argument("--baud", type=int, default=DEFAULT_BAUD, help=f"Baud rate (default: {DEFAULT_BAUD})")
    args = parser.parse_args()

    probe(args.port, args.baud)
