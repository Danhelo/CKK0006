# Accessware — Session 1 Progress

**Date:** 2025-01-31
**Plan:** `2025-01-31-accessware-design.md`
**Goal:** Full project scaffold, serial firmware, Python backend core, bundled tests, Next.js frontend scaffold
**Status:** COMPLETE

---

## What Was Built

### Step 1: Directory Scaffold
- Created `accessware/{frontend,backend,tests/{bundled,custom}}`
- Created `Sketches/serial_control/src/` with all 7 source files copied from `Sketches/Arm/src/`
- `.gitkeep` in `tests/custom/`

### Step 2: Arduino `serial_control.ino`
- **File:** `Sketches/serial_control/serial_control.ino`
- Serial command listener replacing joystick input
- Protocol: `MOVE,s1,s2,s3,s4,speed\n` / `READ\n` / `READY\n`
- Compiles: **6726 bytes (21%)** program, **378 bytes (18%)** SRAM

### Step 3a: `interpolation.py`
- **File:** `accessware/backend/interpolation.py`
- Exact mirror of `CokoinoArm::do_action()` (CokoinoArm.cpp:98-124)
- `interpolate_poses()` — generator yielding 181 (angles, elapsed_ms) tuples
- `total_duration_ms()` — returns `speed * 200`
- `predict_angle_at_time()` — angles at arbitrary time point
- Edge case replicated: target == current oscillates between `current` and `current-1`

### Step 3b: `serial_bridge.py`
- **File:** `accessware/backend/serial_bridge.py`
- `SerialBridge` — pyserial + `asyncio.to_thread()`, 9600 baud, READY wait, 5s timeout
- `MockSerialBridge` — simulates protocol with `asyncio.sleep()` for timing
- Both implement `BridgeProtocol` (connect, disconnect, move, read_angles)

### Step 3c: `test_runner.py`
- **File:** `accessware/backend/test_runner.py`
- Loads tests from `tests/bundled/` and `tests/custom/`
- Sequential step execution: MOVE → stream predicted angles → DONE → hold
- Metrics: range coverage, repeatability, timing, path divergence, ergonomic flags
- `on_state_change` async callback for WebSocket streaming
- Pause/resume/stop controls

### Step 3d: `main.py` + dependencies
- **File:** `accessware/backend/main.py`
- FastAPI: `GET /tests`, `GET /tests/{name}`, `POST /tests`, `WS /ws`
- WebSocket: run_test, pause, stop, jog, read_angles
- CORS for `localhost:3000`, auto-fallback to mock bridge
- **File:** `accessware/backend/requirements.txt` — fastapi, uvicorn[standard], pyserial
- **File:** `accessware/backend/__init__.py`
- **Venv:** `accessware/backend/.venv/` with all deps installed

### Step 4: Bundled Test JSONs (5 files)
All in `accessware/tests/bundled/`:

| File | Steps | Speed | Repeats |
|------|-------|-------|---------|
| `joystick-full-range-sweep.json` | 9 | 15 | 3 |
| `limited-mobility-simulation.json` | 9 | 15 | 3 |
| `grip-and-press.json` | 6 | 12 | 1 |
| `repetitive-use-fatigue.json` | 5 | 10 | 10 |
| `designed-path-straight-line.json` | 5 | 15 | 1 |

### Step 5: Next.js Frontend
- Scaffolded with `create-next-app@16.1.6` — TypeScript, Tailwind v4, ESLint, App Router
- Installed: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`
- Initialized: `shadcn/ui`
- **Pages:**
  - `app/page.tsx` — Hero landing with headline + CTA link to `/dashboard`
  - `app/dashboard/page.tsx` — 60/40 split layout (3D left, controls right)
- **Components:**
  - `components/arm-3d.tsx` — R3F Canvas with placeholder geometry (cylinder base, box segments, sphere gripper, OrbitControls)
  - `components/test-runner.tsx` — Test selector dropdown, Run/Pause/Stop buttons, step log placeholder
  - `components/test-results.tsx` — Results panel placeholder
  - `components/record-mode.tsx` — 4 servo sliders, Capture Pose button, Save Test

---

## Verification Results

| Check | Result |
|-------|--------|
| `arduino-cli compile` (serial_control) | 6726 bytes (21%), 378 bytes SRAM (18%) |
| `uvicorn accessware.backend.main:app` starts | Starts on :8000, serves /tests |
| `GET /tests` returns 5 bundled tests | All 5 returned with correct schema |
| `interpolation.py` edge case tests | 5/5 assertions pass |
| `npm run build` (frontend) | Static pages for `/` and `/dashboard` |

---

## File Inventory

```
Sketches/serial_control/
├── serial_control.ino          # NEW — serial command firmware
└── src/                        # COPIED from Sketches/Arm/src/
    ├── CokoinoArm.h
    ├── CokoinoArm.cpp
    ├── CokoinoServo.h
    ├── CokoinoServo.cpp
    ├── CokoinoJoyStick.h
    ├── CokoinoJoyStick.cpp
    └── ServoTimers.h

accessware/
├── backend/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app + WebSocket
│   ├── serial_bridge.py        # Serial + Mock bridge
│   ├── test_runner.py          # Test execution engine
│   ├── interpolation.py        # do_action() mirror
│   ├── requirements.txt        # fastapi, uvicorn[standard], pyserial
│   └── .venv/                  # Python virtual environment (installed)
├── frontend/                   # Next.js 16 app
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Root layout (title: Accessware)
│   │   ├── globals.css         # Tailwind + shadcn vars
│   │   └── dashboard/
│   │       └── page.tsx        # Dashboard (60/40 split)
│   ├── components/
│   │   ├── arm-3d.tsx          # R3F 3D arm placeholder
│   │   ├── test-runner.tsx     # Test controls UI
│   │   ├── test-results.tsx    # Results panel
│   │   └── record-mode.tsx     # Pose recording UI
│   ├── lib/utils.ts            # shadcn utility (cn)
│   ├── components.json         # shadcn config
│   └── package.json            # All deps installed
└── tests/
    ├── bundled/                # 5 starter test JSONs
    │   ├── joystick-full-range-sweep.json
    │   ├── limited-mobility-simulation.json
    │   ├── grip-and-press.json
    │   ├── repetitive-use-fatigue.json
    │   └── designed-path-straight-line.json
    └── custom/
        └── .gitkeep
```

---

## Next Session: What to Build

The scaffold and core logic are done. The next session should focus on **wiring everything together into a working demo**:

### Priority 1: Frontend ↔ Backend Integration
- Wire `test-runner.tsx` to fetch tests from `GET /tests` and display in selector
- Connect Run/Pause/Stop buttons to WebSocket commands
- Stream `state` messages from WebSocket to update step log in real-time
- Feed predicted angles from WebSocket into the 3D arm component

### Priority 2: 3D Arm Model
- Replace placeholder geometry with proper kinematic arm (servo1=base rotation, servo2/servo3=segments, servo4=gripper)
- Accept angles as props, apply rotations to joints
- Add trail rendering for actual path vs designed path (ghost overlay)

### Priority 3: Results Display
- Wire `test-results.tsx` to display metrics from `test_complete` WebSocket message
- Range coverage bar charts per servo
- Path divergence % with mini overlay
- Pass/Warning/Fail badge

### Priority 4: Record Mode
- Wire sliders to `jog` WebSocket command
- Capture Pose → accumulate step list
- Save Test → `POST /tests`

### Priority 5: Landing Page Polish
- Scroll-based sections (Problem, Concept, Solution, How It Works)
- Embedded dashboard preview or demo video placeholder
- Presentation loop mode toggle

---

## Meta-Instructions for Future Sessions

### How to Start the Backend
```bash
cd accessware/backend
source .venv/bin/activate
PYTHONPATH=/path/to/CKK0006 uvicorn accessware.backend.main:app --reload --port 8000
```
The `PYTHONPATH` must point to the `CKK0006` root so Python resolves `accessware.backend.*` imports. Auto-fallback to mock mode if no Arduino is connected.

### How to Start the Frontend
```bash
cd accessware/frontend
npm run dev
```
Runs on `localhost:3000`. Backend must be on `localhost:8000` for CORS.

### How to Compile the Firmware
```bash
arduino-cli compile --fqbn arduino:avr:nano:cpu=atmega328 Sketches/serial_control/
arduino-cli upload -p /dev/cu.usbserial-2110 --fqbn arduino:avr:nano:cpu=atmega328 Sketches/serial_control/
```

### Key Architecture Decisions
- **Firmware does the interpolation** (do_action blocks for ~3s at speed 15). Python mirrors the same math for the 3D viz. No high-frequency polling needed.
- **Mock bridge** lets you develop the full UI without hardware. The backend auto-detects serial availability.
- **WebSocket is the primary real-time channel.** REST endpoints are for test CRUD only.
- **Test JSONs are files on disk**, not in a database. Bundled tests are read-only in the UI; custom tests go to `tests/custom/`.

### Important Code Details
- `interpolation.py:_step_angle()` — When target == current, servo oscillates ±1. This is faithful to firmware behavior. Do not "fix" this.
- `serial_bridge.py` uses `asyncio.to_thread()` for all serial I/O — no additional threading dependencies needed.
- `test_runner.py` streams predicted angles via the `on_state_change` callback. The WebSocket handler in `main.py` forwards these directly to the frontend.
- Frontend components are `"use client"` where needed (arm-3d, test-runner, test-results, record-mode). Dashboard page itself is a server component.

### The Loopback
```
Study @docs/plans/2025-01-31-accessware-design.md for specifications.
Study @docs/plans/2025-01-31-session-1-progress.md for what's done.
Study @.claude/rules for technical requirements.
Implement what is not implemented.
Run build and verify.
```
