import { useEffect, useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";
import type { ClientEvent, ServerEvent } from "../types/websocket";

const WS_URL = "ws://localhost:3001/ws";

export function useWebSocket(roomId: string) {
  const store = useCanvasStore();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    store.setConnectionStatus("connecting");

    const socket = new WebSocket(`${WS_URL}?room=${roomId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      store.setConnectionStatus("connected");
      store.initWs((data: ClientEvent) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(data));
        }
      });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ServerEvent;

        switch (data.type) {
          case "init_room":
            store.applyRemoteShapes(data.shapes);
            break;
          case "shape_added":
            store.applyRemoteShapeAdd(data.shape);
            break;
          case "shape_updated":
            store.applyRemoteShapeUpdate(data.id, data.data);
            break;
          case "shape_deleted":
            store.applyRemoteShapeDelete(data.id);
            break;
          case "peer_joined":
          case "peer_left":
          case "cursor_moved":
          case "connected":
            break;
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    socket.onclose = () => {
      store.setConnectionStatus("disconnected");
      store.initWs(() => {});
    };

    socket.onerror = () => {
      store.setConnectionStatus("disconnected");
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  return null;
}
