import { Rect } from "react-konva";
import type { RectShape } from "../../store/useCanvasStore";

interface Props {
  shape: RectShape;
  isSelected: boolean;
  onSelect: () => void;
}

export function RectShape({ shape, isSelected, onSelect }: Props) {
  return (
    <Rect
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fill || "transparent"}
      stroke={shape.stroke || "#8b5cf6"}
      strokeWidth={shape.strokeWidth || 3}
      cornerRadius={shape.cornerRadius || 0}
      rotation={shape.rotation || 0}
      scaleX={shape.scaleX || 1}
      scaleY={shape.scaleY || 1}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
