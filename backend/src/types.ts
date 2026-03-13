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

export type ClientEvent =
  | { type: "add_shape"; shape: Shape }
  | { type: "update_shape"; id: string; data: Partial<Shape> }
  | { type: "delete_shape"; id: string }
  | { type: "cursor_move"; x: number; y: number };

export type ServerEvent =
  | { type: "init_room"; shapes: Shape[] }
  | { type: "shape_added"; shape: Shape }
  | { type: "shape_updated"; id: string; data: Partial<Shape> }
  | { type: "shape_deleted"; id: string }
  | { type: "cursor_moved"; userId: string; x: number; y: number }
  | { type: "peer_joined"; userId: string }
  | { type: "peer_left"; userId: string }
  | { type: "connected"; roomId: string };
