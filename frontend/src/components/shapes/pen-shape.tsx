import { Line } from "react-konva";
import type { PenShape } from "../../store/useCanvasStore";

interface Props {
  shape: PenShape;
  isSelected: boolean;
  onSelect: () => void;
}

export function PenShape({ shape, isSelected, onSelect }: Props) {
  return (
    <Line
      id={shape.id}
      points={shape.points}
      x={shape.x}
      y={shape.y}
      stroke={shape.stroke || "#f8fafc"}
      strokeWidth={shape.strokeWidth || 3}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={
        shape.stroke === "eraser" ? "destination-out" : "source-over"
      }
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
