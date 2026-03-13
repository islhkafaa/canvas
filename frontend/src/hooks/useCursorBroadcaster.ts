import { useRef } from "react";
import { useCanvasStore } from "../store/useCanvasStore";

export function useCursorBroadcaster() {
  const broadcastCursor = useCanvasStore((s) => s.broadcastCursor);
  const lastBroadcastRef = useRef(0);
  const THROTTLE_MS = 30;

  const emitCursor = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastBroadcastRef.current > THROTTLE_MS) {
      broadcastCursor(x, y);
      lastBroadcastRef.current = now;
    }
  };

  return emitCursor;
}
