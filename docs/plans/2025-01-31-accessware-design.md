# Accessware — Design Document

> A physical + software QA platform that uses a robotic arm to simulate how disabled users interact with accessibility hardware, revealing "desire paths" where real usage diverges from design assumptions.

**Date:** 2025-01-31
**Status:** Draft
**Hackathon Tracks:** Desire Paths + Roots & Renewal (Social Impact)

---

## 1. Vision

Accessibility hardware — joysticks, big buttons, adaptive controllers — is designed by able-bodied engineers who test it with able-bodied hands. The gap between how these devices are *designed* to be used and how disabled users *actually* use them is invisible until someone gets hurt or gives up.

Accessware makes that gap visible. A robotic arm physically interacts with accessibility hardware the way real users would — with limited range of motion, constrained grip, fatigue patterns — and reports where the design assumptions break down.

The divergence between the intended interaction path and the actual one is the **desire path**: the worn-down grass that tells you where the sidewalk should have been.

**Pitch in one line:** *"We built a robot that uses accessibility hardware the way disabled people actually do, not the way designers assumed they would."*

---

## 2. Architecture Overview

### Deliverables

1. **Landing page** — Human-story-first pitch page that flows into a demo
2. **Test dashboard** — Real-time 3D arm visualization + test pipeline with pass/warn/fail reporting
3. **Python bridge** — Thin FastAPI + WebSocket layer bridging the Next.js frontend to the Arduino Nano over serial

### Hardware

- CKK0006 robotic arm (4 servos on D4-D7, Arduino Nano ATmega328P)
- Kit's two analog joysticks (A0/A1, A2/A3) as "device under test"
- Possibly a DIY big button as a second test target

### Data Flow

```
Next.js Frontend  <--WebSocket-->  Python (FastAPI)  <--Serial-->  Arduino Nano
   (3D viz + UI)                  (test runner)                   (servo control)
```

- Python sends target poses over serial
- Firmware's built-in `do_action()` handles smooth interpolation (1 deg/step, 180 steps, configurable speed)
- Python mirrors the same interpolation math for the 3D visualization — no high-frequency polling needed
- Both sides stay in sync because the math is identical and timing is known

---

## 3. Test System

### Test Sequence Format (JSON)

```json
{
  "name": "joystick-forward-sweep",
  "description": "Simulates pushing joystick forward with limited grip strength",
  "designed_path": [[90, 90, 90, 90], [90, 45, 135, 90], [90, 30, 150, 90]],
  "steps": [
    { "angles": [90, 90, 90, 90], "hold_ms": 500, "label": "rest position" },
    { "angles": [90, 45, 135, 90], "hold_ms": 1000, "label": "approach joystick" },
    { "angles": [90, 30, 150, 60], "hold_ms": 500, "label": "grip and push forward" }
  ],
  "speed": 15,
  "repeat_count": 3
}
```

### Measurements (per test run)

| Metric | What it measures |
|--------|-----------------|
| **Range of motion coverage** | Which servo angle ranges were reached vs full available range |
| **Repeatability** | Variance across repeated runs of the same sequence |
| **Timing** | Duration of each step, total sequence time |
| **Ergonomic flags** | Sharp direction reversals, extreme angles held too long |
| **Path divergence** | Overlay of "designed path" vs actual executed path, scored as deviation % |

### Designed Path Feature

The user defines an intended interaction path (the "blueprint"). The robot executes it. The dashboard overlays both paths and highlights the delta. The gap is the desire path — the visualization of where design assumptions fail real users.

### Three Ways to Create Tests

1. **Load bundled starter tests** — Pre-determined tests that ship with the app, ready to demo out of the box
2. **Author JSON directly** — Write or edit test files, load them in the dashboard
3. **Record from UI** — Use sliders or virtual joystick in the dashboard to jog the arm to each pose, click "capture" at each point, save as a new test sequence

### Leveraging Existing Firmware

The CokoinoArm firmware already has an action recording/playback system:
- Stores up to 10 poses of 4 servo angles in a `int act[10][4]` array
- `captureAction()` reads current servo angles
- `do_action()` interpolates smoothly to target (1 deg/step, 180 iterations, configurable speed in ms)
- Linear interpolation: `if (target > current) current += 1, else current -= 1`
- Total time per pose transition: `180 x speed` ms (e.g., speed=15 -> 2.7s) + `speed x 20` hold

The Python backend replicates this same interpolation math so the 3D visualization stays in lockstep with the physical arm without needing real-time position feedback.

---

## 4. Bundled Starter Tests

Pre-loaded tests in `tests/bundled/` so the demo works immediately:

| Test | Purpose |
|------|---------|
| **Joystick Full Range Sweep** | Moves through all four axes (forward, back, left, right). Designed path: clean cross pattern. Validates full range of input. |
| **Limited Mobility Simulation** | Same sweep but constrained to smaller angles — simulating a user who can't push the stick all the way. Reveals whether partial inputs register. |
| **Grip and Press** | Approach target, grip/press, release, return to rest. Tests the basic "can a user activate this thing" workflow. |
| **Repetitive Use Fatigue** | Repeats a simple press motion 10+ times. Measures consistency and timing drift — simulating sustained use with a fatigue condition. |
| **Designed Path: Straight Line** | Simple A-to-B intended path. Arm follows it, dashboard shows deviation. Good baseline demo for path divergence feature. |

Each test ships as a read-only JSON file. Users can duplicate and modify them.

---

## 5. Landing Page

**Story arc (scrolls top to bottom):**

### Hero
Bold headline: *"Who tests the tools designed for the people who need them most?"*
Subtle animation of the arm silhouette in the background. Single CTA: "See how it works."

### The Problem
Short, punchy copy. Accessibility hardware is designed by able-bodied engineers. Testing is manual, inconsistent, and rarely simulates real user constraints.

### The Concept
Introduce desire paths. *"What if we could see how disabled users actually interact with hardware, not how designers assumed they would?"*
Visual: split showing a clean designed path vs a messy real path diverging from it.

### The Solution
Accessware. A robotic arm that physically tests accessibility hardware using real interaction patterns. Transition into a dashboard preview — embedded demo video loop or animated screenshots of the 3D viz + test results.

### How It Works
Three steps: Define a test -> Robot executes it -> See where design fails users. Clean icons or illustrations for each.

### Live Demo / Dashboard Preview
Smooth transition point. Link to the actual dashboard or embed a looping video of a real test run with 3D visualization and results.

### Footer
Team info, hackathon context, GitHub link.

**Design tone:** Warm but professional. Empathetic, not clinical.

---

## 6. Test Dashboard

### Layout — Two-Panel Split

**Left panel (60% width): 3D Visualization**
- Simple arm model (cylinders for segments, sphere for gripper) via React Three Fiber
- Mirrors real servo angles in real-time via Python-predicted interpolation
- Gripper tip leaves a colored trail as it moves (actual path)
- Designed path renders as a ghost trail in a second color (semi-transparent)
- Delta between trails highlighted in a third accent color
- Camera can be orbited/zoomed, defaults to clean 3/4 angle

**Right panel (40% width): Test Control + Results**

Stacked vertically:

1. **Test selector** — Dropdown to pick from bundled starter tests, user-authored JSON, or recorded sequences. "New Test" button opens record-from-UI flow.

2. **Test controls** — Play, pause, stop, repeat. Speed slider. Big green "Run Test" button.

3. **Live step log** — Pipeline-style view. Each step shows label, target angles, status (pending / running / complete), and timing. Current step highlighted.

4. **Results summary** (after run completes):
   - Range of motion: bar chart per servo showing coverage %
   - Repeatability score: consistency across repeated runs
   - Path divergence: single % score with mini overlay preview
   - Ergonomic flags: warnings for sharp reversals or extreme holds
   - Overall verdict: Pass / Warning / Fail badge

### Record Mode
Right panel swaps to show 4 servo angle sliders (0-180), a virtual joystick for intuitive control, and a "Capture Pose" button. Each captured pose appears in a reorderable step list. "Save Test" exports to JSON.

### Presentation Loop Mode
Toggle in the top nav. When enabled, the dashboard auto-cycles: loads a test, runs it, shows results for a few seconds, moves to the next test. Runs indefinitely for table demos or video recording.

---

## 7. Python Backend

**Three responsibilities only — as thin as possible:**

### Serial Bridge (`serial_bridge.py`)
- Connects to `/dev/cu.usbserial-2110` at 9600 baud via pyserial
- Sends angle commands as comma-separated values: `90,45,135,60\n`
- Receives acknowledgment from Arduino

### Test Runner (`test_runner.py`)
- Loads test JSON files from `tests/` directory (bundled + custom)
- Executes steps sequentially: sends target angles, runs interpolation prediction, tracks timing
- Streams live state over WebSocket: current step, predicted servo angles, elapsed time, status

### WebSocket API (`main.py` — FastAPI)
- `GET /tests` — list available test files
- `POST /tests` — save a new test sequence from the record UI
- `WS /ws` — real-time bidirectional channel:
  - Frontend sends: run test, pause, stop, jog to angle (record mode)
  - Backend sends: current angles, step progress, test results, connection status

### Interpolation Mirror (`interpolation.py`)
Replicates the firmware's `do_action()` math:
- Linear interpolation, 1 degree per step
- 180 steps at configurable speed
- Hold at final position for `speed x 20` ms
- Feeds predicted angles to the frontend for 3D visualization

### Dependencies (minimal)
- `fastapi` + `uvicorn`
- `pyserial`
- `websockets` (bundled with fastapi)

---

## 8. Firmware

### New Sketch: `Sketches/serial_control/`

A new Arduino sketch that replaces joystick input with a serial command listener. Reuses the existing `CokoinoArm`, `CokoinoServo`, and `CokoinoJoyStick` classes from `src/`.

**Serial protocol:**
- Receive: `MOVE,90,45,135,60,15\n` (angles for 4 servos + speed)
- Receive: `READ\n` (request current servo angles)
- Send: `ACK,90,45,135,60\n` (acknowledge with current angles)
- Send: `DONE\n` (movement complete)

The stock `Arm.ino` joystick firmware remains untouched as a fallback.

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| 3D Visualization | React Three Fiber + Three.js |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Python 3.13 + FastAPI + Uvicorn |
| Serial | pyserial |
| Firmware | Arduino C++ (ATmega328P) |

---

## 10. Project Structure

```
CKK0006/
├── Sketches/
│   ├── Arm/                    # Original joystick firmware (untouched)
│   ├── serial_control/         # New: serial command listener sketch
│   └── ...                     # Existing test sketches
├── accessware/
│   ├── frontend/               # Next.js app
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── dashboard/
│   │   │       └── page.tsx    # Test dashboard
│   │   ├── components/
│   │   │   ├── arm-3d.tsx      # Three.js arm visualization
│   │   │   ├── test-runner.tsx # Test controls + step log
│   │   │   ├── test-results.tsx# Results summary panel
│   │   │   └── record-mode.tsx # Pose capture UI
│   │   └── public/
│   ├── backend/
│   │   ├── main.py             # FastAPI app + WebSocket
│   │   ├── serial_bridge.py    # Arduino serial communication
│   │   ├── test_runner.py      # Test execution engine
│   │   ├── interpolation.py    # Mirror of firmware's do_action() math
│   │   └── requirements.txt
│   └── tests/
│       ├── bundled/            # 5 starter tests (read-only in UI)
│       └── custom/             # User-created tests
├── docs/
│   ├── plans/
│   │   └── 2025-01-31-accessware-design.md  # This document
│   ├── DECISIONS-LOG.md
│   └── PROJECT-PLAN.md
└── CLAUDE.md
```

---

## 11. Demo Flow (Hackathon Presentation)

**Optimized for both live table demos and recorded video:**

1. **Landing page loads** — Judges read the story, see the hero animation
2. **Scroll or click "See how it works"** — Smooth transition to dashboard
3. **Dashboard in presentation loop mode** — Auto-cycles through bundled tests:
   - Test loads, 3D arm starts moving
   - Step log populates in real-time
   - Designed path (ghost trail) vs actual path (solid trail) diverge visually
   - Results appear: pass/warn/fail with metrics
   - Brief pause, then next test auto-loads
4. **Physical arm on the table** — Moving in sync with the 3D visualization
5. **Loop repeats indefinitely** — Works whether judges watch for 30 seconds or 5 minutes

**Narrative arc:** Human story (why this matters) -> Technical proof (it actually works) -> Insight (here's what we found)

---

## 12. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Firmware interpolation vs Python interpolation | Both — firmware for physical, Python for viz | Keeps serial traffic minimal, proven smooth motion on hardware side |
| Test storage format | JSON files | Human-readable, version-controllable, easy to author and load |
| Serial protocol | Simple CSV commands | Minimal parsing on ATmega328P, easy to debug |
| 3D library | React Three Fiber | Integrates natively with React/Next.js, good ecosystem |
| Backend framework | FastAPI | Async WebSocket support, minimal boilerplate, Python ecosystem |
| Landing page + Dashboard | Single Next.js app, two routes | One deployment, shared components, clean URL structure |
