import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

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

export interface BaseShape {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface PenShape extends BaseShape {
  type: "pen";
  points: number[];
}

export interface RectShape extends BaseShape {
  type: "rect";
  width: number;
  height: number;
  cornerRadius?: number;
}

export interface EllipseShape extends BaseShape {
  type: "ellipse";
  radiusX: number;
  radiusY: number;
}

export interface ArrowShape extends BaseShape {
  type: "arrow";
  points: number[];
}

export type Shape = PenShape | RectShape | EllipseShape | ArrowShape;

interface CanvasState {
  tool: Tool;
  shapes: Shape[];
  roomId: string;
  connectionStatus: ConnectionStatus;
  isDrawing: boolean;
  selectedShapeId: string | null;
  stageConfig: { x: number; y: number; scale: number };
}

interface CanvasActions {
  setTool: (tool: Tool) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRoomId: (id: string) => void;

  addShape: (shape: Shape) => void;
  updateShape: (id: string, data: Partial<Shape>) => void;
  removeShape: (id: string) => void;

  setIsDrawing: (isDrawing: boolean) => void;
  setSelectedShapeId: (id: string | null) => void;
  setStageConfig: (config: Partial<CanvasState["stageConfig"]>) => void;
}

export const useCanvasStore = create<CanvasState & CanvasActions>()(
  immer((set) => ({
    tool: "pen",
    shapes: [],
    roomId: "default",
    connectionStatus: "disconnected",
    isDrawing: false,
    selectedShapeId: null,
    stageConfig: { x: 0, y: 0, scale: 1 },

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

    addShape: (shape) =>
      set((state) => {
        state.shapes.push(shape);
      }),

    updateShape: (id, data) =>
      set((state) => {
        const shape = state.shapes.find((s) => s.id === id);
        if (shape) {
          Object.assign(shape, data);
        }
      }),

    removeShape: (id) =>
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
