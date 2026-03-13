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
  zIndex?: number;
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

export interface TextShape extends BaseShape {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface ImageShape extends BaseShape {
  type: "image";
  dataUrl: string;
  width: number;
  height: number;
}

export type Shape =
  | PenShape
  | RectShape
  | EllipseShape
  | ArrowShape
  | TextShape
  | ImageShape;

export type ClientEvent =
  | { type: "add_shape"; shape: Shape }
  | { type: "update_shape"; id: string; data: Partial<Shape> }
  | { type: "delete_shape"; id: string }
  | {
      type: "reorder_shape";
      id: string;
      direction: "up" | "down" | "top" | "bottom";
    }
  | { type: "clear_room" }
  | { type: "cursor_move"; x: number; y: number };

export type ServerEvent =
  | { type: "connected"; userId: string; roomId: string }
  | {
      type: "init_room";
      shapes: Shape[];
      peers: Record<string, { x: number; y: number }>;
    }
  | { type: "shape_added"; shape: Shape }
  | { type: "shape_updated"; id: string; data: Partial<Shape> }
  | { type: "shape_deleted"; id: string }
  | {
      type: "reorder_shape";
      id: string;
      direction: "up" | "down" | "top" | "bottom";
    }
  | { type: "room_cleared" }
  | { type: "peer_joined"; userId: string }
  | { type: "peer_left"; userId: string }
  | { type: "cursor_moved"; userId: string; x: number; y: number };
