import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ClientEvent, Shape } from "../types/websocket";

export type Tool =
  | "select"
  | "pen"
  | "rect"
  | "ellipse"
  | "arrow"
  | "text"
  | "eraser"
  | "pan";
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface CanvasState {
  tool: Tool;
  shapes: Shape[];
  roomId: string;
  connectionStatus: ConnectionStatus;
  myUserId: string | null;
  peers: Record<string, { x: number; y: number; color: string }>;
  isDrawing: boolean;
  selectedShapeId: string | null;
  stageConfig: { x: number; y: number; scale: number };
  wsSend: ((event: ClientEvent) => void) | null;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c5e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];
function getRandomColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface CanvasActions {
  setTool: (tool: Tool) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomId: (id: string) => void;
  initWs: (sendFn: (event: ClientEvent) => void) => void;

  addShape: (shape: Shape) => void;
  updateShape: (id: string, data: Partial<Shape>) => void;
  removeShape: (id: string) => void;
  broadcastCursor: (x: number, y: number) => void;

  applyConnected: (userId: string) => void;
  applyRemoteRoomInit: (shapes: Shape[], peers: string[]) => void;
  applyRemoteShapeAdd: (shape: Shape) => void;
  applyRemoteShapeUpdate: (id: string, data: Partial<Shape>) => void;
  applyRemoteShapeDelete: (id: string) => void;
  applyRemotePeerJoined: (userId: string) => void;
  applyRemotePeerLeft: (userId: string) => void;
  applyRemoteCursorMove: (userId: string, x: number, y: number) => void;

  setIsDrawing: (isDrawing: boolean) => void;
  setSelectedShapeId: (id: string | null) => void;
  setStageConfig: (config: Partial<CanvasState["stageConfig"]>) => void;
}

export const useCanvasStore = create<CanvasState & CanvasActions>()(
  immer((set, get) => ({
    tool: "pen",
    shapes: [],
    roomId: "default",
    connectionStatus: "disconnected",
    myUserId: null,
    peers: {},
    isDrawing: false,
    selectedShapeId: null,
    stageConfig: { x: 0, y: 0, scale: 1 },
    wsSend: null,

    setTool: (tool) =>
      set((state) => {
        state.tool = tool;
        if (tool !== "select") {
          state.selectedShapeId = null;
        }
      }),

    setConnectionStatus: (status) =>
      set((state) => {
        state.connectionStatus = status;
      }),

    setRoomId: (id) =>
      set((state) => {
        state.roomId = id;
      }),

    initWs: (sendFn) =>
      set((state) => {
        state.wsSend = sendFn as any;
      }),

    broadcastCursor: (x, y) => {
      get().wsSend?.({ type: "cursor_move", x, y });
    },

    addShape: (shape) => {
      set((state) => {
        state.shapes.push(shape);
      });
      get().wsSend?.({ type: "add_shape", shape });
    },

    updateShape: (id, data) => {
      set((state) => {
        const shape = state.shapes.find((s) => s.id === id);
        if (shape) {
          Object.assign(shape, data);
        }
      });
      get().wsSend?.({ type: "update_shape", id, data });
    },

    removeShape: (id) => {
      set((state) => {
        state.shapes = state.shapes.filter((s) => s.id !== id);
        if (state.selectedShapeId === id) {
          state.selectedShapeId = null;
        }
      });
      get().wsSend?.({ type: "delete_shape", id });
    },

    applyConnected: (userId) =>
      set((state) => {
        state.myUserId = userId;
      }),

    applyRemoteRoomInit: (shapes, peers) =>
      set((state) => {
        state.shapes = shapes;
        state.peers = {};
        for (const peerId of peers) {
          state.peers[peerId] = { x: 0, y: 0, color: getRandomColor(peerId) };
        }
      }),

    applyRemoteShapeAdd: (shape) =>
      set((state) => {
        if (!state.shapes.find((s) => s.id === shape.id)) {
          state.shapes.push(shape);
        }
      }),

    applyRemoteShapeUpdate: (id, data) =>
      set((state) => {
        const shape = state.shapes.find((s) => s.id === id);
        if (shape) {
          Object.assign(shape, data);
        }
      }),

    applyRemoteShapeDelete: (id) =>
      set((state) => {
        state.shapes = state.shapes.filter((s) => s.id !== id);
        if (state.selectedShapeId === id) {
          state.selectedShapeId = null;
        }
      }),

    applyRemotePeerJoined: (userId) =>
      set((state) => {
        if (!state.peers[userId]) {
          state.peers[userId] = { x: 0, y: 0, color: getRandomColor(userId) };
        }
      }),

    applyRemotePeerLeft: (userId) =>
      set((state) => {
        delete state.peers[userId];
      }),

    applyRemoteCursorMove: (userId, x, y) =>
      set((state) => {
        if (state.peers[userId]) {
          state.peers[userId].x = x;
          state.peers[userId].y = y;
        }
      }),

    setIsDrawing: (isDrawing) =>
      set((state) => {
        state.isDrawing = isDrawing;
      }),

    setSelectedShapeId: (id) =>
      set((state) => {
        state.selectedShapeId = id;
      }),

    setStageConfig: (config) =>
      set((state) => {
        state.stageConfig = { ...state.stageConfig, ...config };
      }),
  })),
);
