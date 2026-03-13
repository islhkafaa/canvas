import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type Tool = "select" | "pen" | "shapes" | "text" | "eraser" | "pan";
export type ConnectionStatus = "disconnected" | "connecting" | "connected";

export interface Shape {
  id: string;
  type: string;
  [key: string]: unknown;
}

interface CanvasState {
  tool: Tool;
  shapes: Shape[];
  roomId: string;
  connectionStatus: ConnectionStatus;
}

interface CanvasActions {
  setTool: (tool: Tool) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  addShape: (shape: Shape) => void;
  setRoomId: (id: string) => void;
}

export const useCanvasStore = create<CanvasState & CanvasActions>()(
  immer((set) => ({
    tool: "pen",
    shapes: [],
    roomId: "default",
    connectionStatus: "disconnected",

    setTool: (tool) =>
      set((state) => {
        state.tool = tool;
      }),

    setConnectionStatus: (status) =>
      set((state) => {
        state.connectionStatus = status;
      }),

    addShape: (shape) =>
      set((state) => {
        state.shapes.push(shape);
      }),

    setRoomId: (id) =>
      set((state) => {
        state.roomId = id;
      }),
  })),
);
