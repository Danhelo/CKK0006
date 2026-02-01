"""FastAPI backend for Accessware.

Endpoints:
    GET  /tests        — list available tests
    GET  /tests/{name} — load specific test
    POST /tests        — save new test (record mode)
    GET  /health       — bridge status & diagnostics
    WS   /ws           — bidirectional real-time channel

WebSocket messages (JSON):
    Frontend → Backend:  run_test, pause, stop, jog, read_angles, ping
    Backend → Frontend:  state, step_complete, test_complete, angles, pong, error
"""

from __future__ import annotations

import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .serial_bridge import MockSerialBridge, SerialBridge
from .test_runner import TestRunner, list_tests, load_test, save_test

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Shutdown: disconnect serial bridge to prevent port lockup
    if _bridge is not None:
        logger.info("Shutting down — disconnecting bridge")
        await _bridge.disconnect()


app = FastAPI(title="Accessware", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Bridge singleton (auto-fallback to mock) --------------------------------

_bridge: SerialBridge | MockSerialBridge | None = None


async def get_bridge() -> SerialBridge | MockSerialBridge:
    global _bridge
    if _bridge is not None:
        return _bridge
    try:
        bridge = SerialBridge()
        await bridge.connect()
        _bridge = bridge
        logger.info("Using real serial bridge")
    except Exception as exc:
        logger.warning("Serial unavailable (%s), falling back to mock", exc)
        bridge = MockSerialBridge()
        await bridge.connect()
        _bridge = bridge
    return _bridge


# -- REST endpoints ----------------------------------------------------------

@app.get("/tests")
async def get_tests():
    return list_tests()


@app.get("/tests/{name}")
async def get_test(name: str):
    try:
        return load_test(name)
    except FileNotFoundError:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=404, content={"error": f"Test '{name}' not found"})


@app.post("/tests")
async def create_test(data: dict):
    path = save_test(data)
    return {"status": "saved", "path": str(path)}


@app.get("/health")
async def health():
    bridge = await get_bridge()
    healthy = await bridge.ping()
    return {
        "bridge_type": bridge.bridge_type,
        "connected": bridge.connected,
        "healthy": healthy,
        "port": getattr(bridge, "_port", None),
    }


# -- WebSocket ---------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    bridge = await get_bridge()
    runner: TestRunner | None = None

    async def send_state(msg: dict):
        try:
            logger.info("WS OUT → %s", msg.get("type", "unknown"))
            await ws.send_json(msg)
        except Exception:
            pass

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            action = msg.get("type", "")
            logger.info("WS IN  ← %s | %s", action, {k: v for k, v in msg.items() if k != "type"})

            if action == "run_test":
                test_name = msg.get("name")
                if not test_name:
                    await ws.send_json({"type": "error", "message": "Missing test name"})
                    continue
                try:
                    test_data = load_test(test_name)
                except FileNotFoundError:
                    await ws.send_json({"type": "error", "message": f"Test '{test_name}' not found"})
                    continue
                runner = TestRunner(bridge, on_state_change=send_state)
                asyncio.create_task(_run_test_task(runner, test_data, ws))

            elif action == "pause":
                if runner:
                    runner.pause()
                    await ws.send_json({"type": "state", "state": "paused"})

            elif action == "resume":
                if runner:
                    runner.resume()
                    await ws.send_json({"type": "state", "state": "running"})

            elif action == "stop":
                if runner:
                    runner.stop()
                    await ws.send_json({"type": "state", "state": "stopped"})

            elif action == "jog":
                # Direct servo control for record mode
                angles = msg.get("angles")
                speed = msg.get("speed", 15)
                if angles and len(angles) == 4:
                    await bridge.move(angles, speed)
                    current = await bridge.read_angles()
                    await ws.send_json({"type": "angles", "angles": current})

            elif action == "read_angles":
                current = await bridge.read_angles()
                await ws.send_json({"type": "angles", "angles": current})

            elif action == "ping":
                healthy = await bridge.ping()
                await ws.send_json({"type": "pong", "healthy": healthy, "bridge_type": bridge.bridge_type})

            else:
                await ws.send_json({"type": "error", "message": f"Unknown action: {action}"})

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
        if runner:
            runner.stop()


async def _run_test_task(runner: TestRunner, test_data: dict, ws: WebSocket):
    """Run a test in a background task so the WS loop stays responsive."""
    try:
        await runner.run_test(test_data)
    except Exception as exc:
        logger.exception("Test run failed")
        try:
            await ws.send_json({"type": "error", "message": str(exc)})
        except Exception:
            pass
