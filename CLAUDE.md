# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CKK0006 is the Cokoino Robotic Arm Kit — an educational Arduino project for a 4-servo mechanical arm controlled by dual joysticks. Target hardware is Arduino Nano (ATmega328P) with a CH340 USB-to-Serial chip.

## Build & Upload

This is an Arduino project. There is no traditional build system (Makefile, CMake, etc.).

**Arduino IDE workflow:**
1. Open `Sketches/Arm/Arm.ino` in Arduino IDE
2. Board: Arduino Nano, Processor: ATmega328P
3. Verify/Compile: Ctrl+R (Cmd+R on macOS)
4. Upload: Ctrl+U (Cmd+U on macOS)

**Pre-compiled hex upload (no IDE):**
- Use XLoader (Windows) with `Sketches/Arm/build/Arm.ino.hex`

**Required libraries** (bundled in `Libraries/`):**
- `Servo` (v1.1.6) — included as directory
- `IRremote` — included as zip

Install via Arduino IDE: Sketch > Include Library > Add .ZIP Library.

## Testing Individual Components

Each sketch in `Sketches/` tests a single component:
- `joystick/` — Joystick analog input test (Serial Monitor at 9600 baud)
- `Servo_90_ADJ/` — Calibrate all servos to 90° (must run before assembly)
- `servo_code1/` — Manual PWM pulse servo test
- `servo_code2/` — Library-based servo test
- `IR_receive/` — IR remote receiver test
- `Passive_buzzer/` — Buzzer test

## Architecture

### Pin Mapping
| Component | Pin |
|-----------|-----|
| Servo 1 (base rotation) | D4 |
| Servo 2 (arm segment) | D5 |
| Servo 3 (arm segment) | D6 |
| Servo 4 (gripper) | D7 |
| IR receiver | D8 |
| Buzzer | D9 |
| Left joystick X/Y | A0/A1 |
| Right joystick X/Y | A2/A3 |

### Core Classes (in `Sketches/Arm/src/`)

**CokoinoArm** — Facade that owns all hardware objects and provides high-level movement APIs (`up()`, `down()`, `left()`, `right()`, `open()`, `close()`). Also implements an action recording/playback system that stores up to 10 poses of 4 servo angles each.

**CokoinoServo** — Custom servo implementation using AVR timer interrupts (Timer1/3/4/5 ISRs) for precise PWM pulse generation (544–2400μs). Supports up to 48 servos (12 per timer).

**CokoinoJoyStick** — Reads analog joystick values with jitter elimination via median filtering (20 samples, averages middle 10).

### Control Flow (Arm.ino main loop)
1. Read both joysticks (X/Y analog values)
2. Data processing: resolve dominant-axis ambiguity
3. Map joystick deflection to 6 progressive speed levels (0–35ms delay)
4. Execute movement (up/down coordinates servo2+servo3 in opposite directions)
5. Handle action record (right stick up) / playback (right stick down) with buzzer feedback

## Hardware Notes

- CH340 USB driver must be installed before connecting. Drivers are in `CH340 Driver/` for Linux, macOS, and Windows.
- Servos must be calibrated to 90° using `Servo_90_ADJ` sketch before physical assembly.
- Power: USB 5V or external 18650 lithium battery.
