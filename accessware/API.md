# Accessware API Contract

Backend base URL: `http://localhost:8000`

---

## REST Endpoints

### GET /tests

List all available tests (bundled + custom).

**Response:** `200 OK`
```json
[
  {
    "id": "grip-and-press",
    "name": "grip-and-press",
    "description": "Approach an object, grip it, hold...",
    "source": "bundled",
    "file": "/abs/path/to/grip-and-press.json"
  }
]
```

### GET /tests/{id}

Load a test by filename stem (the `id` field from list) or by JSON `name` field.

**Response:** `200 OK` — full test JSON (steps, speed, repeat_count, etc.)

**Response:** `404` — `{"error": "Test 'x' not found"}`

### POST /tests

Save a new custom test (record mode).

**Request body:** full test JSON object with `name`, `steps`, `speed`, etc.

**Response:** `200 OK` — `{"status": "saved", "path": "..."}`

---

## WebSocket: ws://localhost:8000/ws

Bidirectional JSON messages over a single persistent connection.

### Client -> Server Messages

| type | fields | description |
|------|--------|-------------|
| `run_test` | `name: string` | Start executing a test by id/name |
| `pause` | — | Pause the running test |
| `resume` | — | Resume a paused test |
| `stop` | — | Stop/cancel the running test |
| `jog` | `angles: [int,int,int,int], speed?: int` | Direct servo control (record mode) |
| `read_angles` | — | Request current servo positions |

### Server -> Client Messages

| type | fields | description |
|------|--------|-------------|
| `state` | `state: string, ...` | State updates (running, paused, stopped) with context fields |
| `predicted_angles` | `angles: [int,int,int,int], elapsed_ms: float, step: int, repeat: int` | Real-time predicted servo positions during movement |
| `step_complete` | `step: int, repeat: int` | Fired after a step finishes (movement + hold) |
| `test_complete` | `state: string, results: TestResult[]` | All repeats done; includes full results array |
| `angles` | `angles: [int,int,int,int]` | Response to `read_angles` or `jog` |
| `error` | `message: string` | Error description |

### TestResult Shape

```json
{
  "test_name": "grip-and-press",
  "repeat_index": 0,
  "steps": [
    {
      "label": "rest",
      "target_angles": [90, 90, 90, 90],
      "actual_start_angles": [90, 90, 90, 90],
      "actual_end_angles": [90, 90, 90, 90],
      "planned_duration_ms": 2400,
      "actual_duration_ms": 2412.3,
      "hold_ms": 1000
    }
  ],
  "range_coverage": {"servo1": 0.0, "servo2": 16.7, "servo3": 16.7, "servo4": 27.8},
  "repeatability": 0.0,
  "total_time_ms": 15234.5,
  "path_divergence": 0.0,
  "ergonomic_flags": [],
  "verdict": "pass"
}
```

---

## Sequencing Guarantees

1. After `run_test`, the server sends `state` with `state: "running"` immediately.
2. For each step, `predicted_angles` messages stream in real-time during movement (~181 messages per step at ~`speed` ms intervals).
3. `step_complete` fires only AFTER all `predicted_angles` for that step have been sent.
4. `test_complete` fires after all steps in all repeats are done (or after cancellation via `stop`).
5. `jog` uses the blocking `move()` convenience method (waits for DONE before responding).
6. The bridge auto-falls back to mock if no Arduino is connected — all messages work identically.
