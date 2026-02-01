"""Tests for the FastAPI app."""

import pytest
from httpx import ASGITransport, AsyncClient

from accessware.backend.main import app


@pytest.mark.asyncio
async def test_get_tests():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/tests")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert all("id" in t for t in data)


@pytest.mark.asyncio
async def test_get_test_by_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/tests/grip-and-press")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "grip-and-press"
    assert "steps" in data


@pytest.mark.asyncio
async def test_get_test_404():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/tests/nonexistent-test-xyz")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_websocket_read_angles():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        async with client.stream("GET", "/ws") as resp:
            # httpx doesn't support WebSocket natively; use starlette testclient instead
            pass

    # Use starlette's TestClient for WebSocket testing
    from starlette.testclient import TestClient
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as ws:
            ws.send_json({"type": "read_angles"})
            data = ws.receive_json()
            assert data["type"] == "angles"
            assert len(data["angles"]) == 4
