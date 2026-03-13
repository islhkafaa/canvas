import { useEffect, useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";

const WS_URL = "ws://localhost:3001/ws";

export function useWebSocket(roomId: string) {
  const setConnectionStatus = useCanvasStore((s) => s.setConnectionStatus);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setConnectionStatus("connecting");

    const socket = new WebSocket(`${WS_URL}?room=${roomId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnectionStatus("connected");
    };

    socket.onclose = () => {
      setConnectionStatus("disconnected");
    };

    socket.onerror = () => {
      setConnectionStatus("disconnected");
    };

    return () => {
      socket.close();
    };
  }, [roomId, setConnectionStatus]);

  const send = (data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return { send };
}
