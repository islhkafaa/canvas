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
  isDrawing: boolean;
  selectedShapeId: string | null;
  stageConfig: { x: number; y: number; scale: number };
  wsSend: ((event: ClientEvent) => void) | null;
}

interface CanvasActions {
  setTool: (tool: Tool) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomId: (id: string) => void;
  initWs: (sendFn: (event: ClientEvent) => void) => void;

  addShape: (shape: Shape) => void;
  updateShape: (id: string, data: Partial<Shape>) => void;
  removeShape: (id: string) => void;

  applyRemoteShapes: (shapes: Shape[]) => void;
  applyRemoteShapeAdd: (shape: Shape) => void;
  applyRemoteShapeUpdate: (id: string, data: Partial<Shape>) => void;
  applyRemoteShapeDelete: (id: string) => void;

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

    applyRemoteShapes: (shapes) =>
      set((state) => {
        state.shapes = shapes;
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
