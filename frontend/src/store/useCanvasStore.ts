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
  | "image"
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
  history: Shape[][];
  historyStep: number;
  strokeColor: string;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];
export function getRandomColor(userId: string) {
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
  clearShapes: () => void;
  reorderShape: (
    id: string,
    direction: "up" | "down" | "top" | "bottom",
  ) => void;
  broadcastCursor: (x: number, y: number) => void;

  applyConnected: (userId: string) => void;
  applyRemoteRoomInit: (
    shapes: Shape[],
    peers: Record<string, { x: number; y: number }>,
  ) => void;
  applyRemoteShapeAdd: (shape: Shape) => void;
  applyRemoteShapeUpdate: (id: string, data: Partial<Shape>) => void;
  applyRemoteShapeDelete: (id: string) => void;
  applyRemoteReorderShape: (
    id: string,
    direction: "up" | "down" | "top" | "bottom",
  ) => void;
  applyRemoteClearShapes: () => void;
  applyRemotePeerJoined: (userId: string) => void;
  applyRemotePeerLeft: (userId: string) => void;
  applyRemoteCursorMove: (userId: string, x: number, y: number) => void;

  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  setIsDrawing: (isDrawing: boolean) => void;
  setSelectedShapeId: (id: string | null) => void;
  setStageConfig: (config: Partial<CanvasState["stageConfig"]>) => void;
  setStrokeColor: (color: string) => void;
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
    history: [[]],
    historyStep: 0,
    strokeColor: "#8b5cf6",

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
        state.shapes = [];
        state.peers = {};
        state.history = [[]];
        state.historyStep = 0;
        state.selectedShapeId = null;
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

    reorderShape: (id, direction) => {
      set((state) => {
        const index = state.shapes.findIndex((s) => s.id === id);
        if (index === -1) return;

        const shape = state.shapes[index];
        if (!shape) return;

        state.shapes.splice(index, 1);

        if (direction === "up") {
          state.shapes.splice(
            Math.min(index + 1, state.shapes.length),
            0,
            shape,
          );
        } else if (direction === "down") {
          state.shapes.splice(Math.max(index - 1, 0), 0, shape);
        } else if (direction === "top") {
          state.shapes.push(shape);
        } else if (direction === "bottom") {
          state.shapes.unshift(shape);
        }
      });
      get().wsSend?.({ type: "reorder_shape", id, direction } as any);
    },

    applyRemoteReorderShape: (id, direction) => {
      set((state) => {
        const index = state.shapes.findIndex((s) => s.id === id);
        if (index === -1) return;

        const shape = state.shapes[index];
        if (!shape) return;

        state.shapes.splice(index, 1);

        if (direction === "up") {
          state.shapes.splice(
            Math.min(index + 1, state.shapes.length),
            0,
            shape,
          );
        } else if (direction === "down") {
          state.shapes.splice(Math.max(index - 1, 0), 0, shape);
        } else if (direction === "top") {
          state.shapes.push(shape);
        } else if (direction === "bottom") {
          state.shapes.unshift(shape);
        }
      });
    },

    clearShapes: () => {
      set((state) => {
        state.shapes = [];
        state.selectedShapeId = null;
        state.history = [[]];
        state.historyStep = 0;
        state.isDrawing = false;
      });
      get().wsSend?.({ type: "clear_room" });
    },

    applyRemoteClearShapes: () => {
      set((state) => {
        state.shapes = [];
        state.selectedShapeId = null;
        state.history = [[]];
        state.historyStep = 0;
        state.isDrawing = false;
      });
    },

    applyConnected: (userId) =>
      set((state) => {
        state.myUserId = userId;
      }),

    applyRemoteRoomInit: (shapes, peers) =>
      set((state) => {
        state.shapes = shapes;
        state.peers = {};
        for (const peerId of Object.keys(peers)) {
          state.peers[peerId] = {
            x: peers[peerId].x,
            y: peers[peerId].y,
            color: getRandomColor(peerId),
          };
        }
        state.history = [[...shapes]];
        state.historyStep = 0;
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

    setStrokeColor: (color) =>
      set((state) => {
        state.strokeColor = color;
      }),

    saveHistory: () => {
      set((state) => {
        const newHistory = state.history.slice(0, state.historyStep + 1);
        newHistory.push([...state.shapes]);
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          state.historyStep += 1;
        }
        state.history = newHistory;
      });
    },

    undo: () => {
      const state = get();
      if (state.historyStep <= 0) return;

      const previousShapes = state.history[state.historyStep - 1];
      const currentShapes = state.shapes;

      const previousMap = new Map(previousShapes.map((s) => [s.id, s]));
      const currentMap = new Map(currentShapes.map((s) => [s.id, s]));

      for (const id of currentMap.keys()) {
        if (!previousMap.has(id)) {
          state.wsSend?.({ type: "delete_shape", id });
        }
      }

      for (const [id, prevShape] of previousMap.entries()) {
        if (!currentMap.has(id)) {
          state.wsSend?.({ type: "add_shape", shape: prevShape });
        } else {
          const curShape = currentMap.get(id);
          if (JSON.stringify(prevShape) !== JSON.stringify(curShape)) {
            state.wsSend?.({ type: "update_shape", id, data: prevShape });
          }
        }
      }

      set((s) => {
        s.historyStep -= 1;
        s.shapes = JSON.parse(JSON.stringify(previousShapes));
        s.selectedShapeId = null;
      });
    },

    redo: () => {
      const state = get();
      if (state.historyStep >= state.history.length - 1) return;

      const nextShapes = state.history[state.historyStep + 1];
      const currentShapes = state.shapes;

      const nextMap = new Map(nextShapes.map((s) => [s.id, s]));
      const currentMap = new Map(currentShapes.map((s) => [s.id, s]));

      for (const id of currentMap.keys()) {
        if (!nextMap.has(id)) {
          state.wsSend?.({ type: "delete_shape", id });
        }
      }

      for (const [id, nShape] of nextMap.entries()) {
        if (!currentMap.has(id)) {
          state.wsSend?.({ type: "add_shape", shape: nShape });
        } else {
          const curShape = currentMap.get(id);
          if (JSON.stringify(nShape) !== JSON.stringify(curShape)) {
            state.wsSend?.({ type: "update_shape", id, data: nShape });
          }
        }
      }

      set((s) => {
        s.historyStep += 1;
        s.shapes = JSON.parse(JSON.stringify(nextShapes));
        s.selectedShapeId = null;
      });
    },
  })),
);
