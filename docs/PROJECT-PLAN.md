# Handwriting Robot Project Plan

## Goal

Build a robotic arm that captures audio, transcribes it to text, and writes it out in handwriting using the Cokoino CKK0006 robotic arm kit.

## Architecture

```
[Microphone] → [Mac Laptop M4 Pro] → USB-C dongle → USB-A to Mini-USB → [Arduino Nano] → [Servos]
                     |
              Speech-to-Text (Whisper)
              Text → Stroke Paths
              Inverse Kinematics
              Serial commands via pyserial
```

Direct connection. Mac does everything — STT, path planning, IK, and serial communication to the Nano. No middleware.

## Verified Environment

| Component | Status | Details |
|-----------|--------|---------|
| Serial port | CONFIRMED | `/dev/cu.usbserial-2110` (CH340 driver working) |
| Arduino IDE | CONFIRMED | `/Applications/Arduino IDE.app` |
| Python 3 | CONFIRMED | 3.13.5 (Anaconda) |
| pyserial | CONFIRMED | 3.5 installed, serial port opens successfully |

## Hardware Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| Cokoino CKK0006 arm kit | Have | 4 servos, 2 joysticks, shield board |
| Arduino Nano (ATmega328P) | Have | Connected, CH340 visible at `/dev/cu.usbserial-2110` |
| Mac laptop M4 Pro (USB-C only) | Have | Main compute + direct serial to Nano |
| USB-C to USB-A dongle | Have | Bridges Mac to Nano cable |
| USB-A to Mini-USB cable | Have | Connects dongle to Nano |
| 18650 batteries for arm | DON'T HAVE | See Power Strategy below |
| Pen/pencil holder | Need to fabricate | Attach to servo4 gripper |
| Microphone | Need to confirm | For audio capture on Mac |

## Key Decisions

### 1. Direct Mac-to-Nano Connection (no Pi)
- **Decision**: Connect Mac directly to Nano via USB-C dongle + Mini-USB cable
- **Why**: Pi 2 has no SD card to boot. Dongle solves the port mismatch. Eliminates network hop and Pi middleware complexity entirely.
- **Replaces**: Previous Pi-as-middleware plan

### 2. Power Strategy: USB for Now, External Later
- **Decision**: Start with USB power from Mac through the Nano. Add external 5V supply when servo load demands it.
- **What works now**: Mac USB-C port provides 5V @ 900mA (USB 3.x). Enough to power the Nano + light servo testing (1-2 servos, gentle movement).
- **What will fail**: All 4 servos under load simultaneously (needs 1-2A+). Symptoms: servo jitter, Nano resets, erratic movement.
- **Later fix**: Any 5V 2A+ USB phone charger wired to the shield's 5V/GND pins (on a servo header or Nano header). This is purely a power wire addition — no code changes, no architecture changes. Solvable at any point.
- **Risk**: Low. Handwriting motion is sequential and gentle. We can prototype the full pipeline on USB power and add external power when we push for production-quality movement.

### 3. Serial Protocol (TBD)
- Arduino listens on Serial for angle commands
- Format TBD — something like `S1:90,S2:45,S3:120,S4:75\n`
- Replace joystick control loop with Serial command listener
- Baud rate: 9600 (matching existing sketch)

## Project Phases

### Phase 1: Hardware Setup
- [x] Connect Nano to Mac (via USB-C dongle)
- [x] Verify serial port visible (`/dev/cu.usbserial-2110`)
- [x] Confirm Arduino IDE installed
- [x] Confirm Python 3 + pyserial working
- [ ] Calibrate servos to 90 degrees (upload Servo_90_ADJ sketch)
- [ ] Assemble the arm (follow Lesson 5-6 PDFs)
- [ ] Test stock Arm.ino sketch with joysticks

### Phase 2: Serial Command Firmware
- [ ] Write new Arduino sketch: Serial command listener
- [ ] Accept angle commands over Serial (9600 baud)
- [ ] Send acknowledgments back to Mac
- [ ] Test manual commands from Mac (Python script)

### Phase 3: Arm Control from Mac
- [ ] Write Mac-side Python controller script
- [ ] Implement inverse kinematics for 2-link planar arm
- [ ] Measure arm segment lengths for IK parameters
- [ ] Test moving pen tip to X/Y coordinates

### Phase 4: Handwriting Path Generation
- [ ] Implement text-to-stroke-path (vector font or simple block letters)
- [ ] Convert stroke paths to sequences of (x, y) points
- [ ] Convert points to servo angles via IK
- [ ] Stream angle sequences to arm and test writing on paper

### Phase 5: Speech-to-Text Integration
- [ ] Set up audio capture on Mac
- [ ] Integrate Whisper (local or API) for transcription
- [ ] Pipe transcribed text into handwriting pipeline
- [ ] End-to-end test: speak → transcribe → write

## Open Questions

- Arm segment lengths (need physical measurement for IK)
- Pen holder attachment method (3D print? tape? rubber band?)
- Writing surface positioning relative to arm base
- Servo4 gripper adequate for pen holding, or does it need modification?
- External 5V power source available at hackathon? (phone charger, power bank)
