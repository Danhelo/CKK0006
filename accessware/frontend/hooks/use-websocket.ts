"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { WS_URL, WS_RECONNECT_BASE_MS, WS_RECONNECT_MAX_MS } from "@/lib/constants";
import type { WsOutMessage, WsInMessage } from "@/lib/types";

interface UseWebSocketOptions {
  onMessage?: (msg: WsInMessage) => void;
  url?: string;
}

interface UseWebSocketReturn {
  connected: boolean;
  send: (msg: WsOutMessage) => void;
  error: string | null;
  reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { url = WS_URL } = options;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(options.onMessage);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Keep onMessage ref stable across renders
  useEffect(() => {
    onMessageRef.current = options.onMessage;
  }, [options.onMessage]);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    cleanup();

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);

        // Exponential backoff reconnect
        const delay = Math.min(
          WS_RECONNECT_BASE_MS * Math.pow(2, reconnectAttemptsRef.current),
          WS_RECONNECT_MAX_MS
        );
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setError("WebSocket connection failed");
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsInMessage = JSON.parse(event.data);
          onMessageRef.current?.(msg);
        } catch {
          // Ignore malformed messages
        }
      };
    } catch {
      setError("Failed to create WebSocket");
    }
  }, [url, cleanup]);

  const send = useCallback((msg: WsOutMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [connect, cleanup]);

  return { connected, send, error, reconnect };
}
