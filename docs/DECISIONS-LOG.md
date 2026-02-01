# Decisions Log

Chronological record of project decisions and rationale.

---

### ~~001 — Power via Pi GPIO, skip batteries~~ SUPERSEDED by 004
**Date**: 2026-01-31
**Status**: Superseded

---

### ~~002 — Raspberry Pi 2 Model B as middleware~~ SUPERSEDED by 004
**Date**: 2026-01-31
**Status**: Superseded

---

### ~~003 — Raspberry Pi OS Lite 32-bit~~ SUPERSEDED by 004
**Date**: 2026-01-31
**Status**: Superseded

---

### 004 — Direct Mac-to-Nano, drop the Pi entirely
**Date**: 2026-01-31
**Context**: Pi 2 has no SD card available to boot. Found a USB-C to USB-A dongle at hackathon. Mac can now connect directly to Nano.
**Decision**: Connect Mac → USB-C dongle → USB-A to Mini-USB cable → Arduino Nano. Mac handles everything: STT, IK, path planning, and serial communication via pyserial. Pi is out of the picture.
**Supersedes**: Decisions 001, 002, 003.
**Verified**: Serial port `/dev/cu.usbserial-2110` confirmed working. pyserial opens it successfully.

---

### 005 — USB power for now, external 5V later
**Date**: 2026-01-31
**Context**: No batteries, no Pi GPIO. Only power source is Mac USB through the Nano.
**Decision**: Use USB power (~900mA from USB 3.x) for prototyping. Add external 5V 2A+ supply (phone charger to shield 5V/GND pins) when servo current demands it.
**Tradeoff**: Light servo testing works fine. All 4 servos under load will brown out. This is a wiring-only fix that can happen at any time without code changes.
