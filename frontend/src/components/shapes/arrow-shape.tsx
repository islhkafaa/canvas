import { Arrow } from "react-konva";
import type { ArrowShape as ArrowShapeType } from "../../types/websocket";

interface ArrowShapeProps {
  shape: ArrowShapeType;
  isSelected: boolean;
  onSelect: () => void;
}

export function ArrowShape({ shape, isSelected, onSelect }: ArrowShapeProps) {
  return (
    <Arrow
      id={shape.id}
      points={shape.points}
      stroke={shape.stroke || "#f8fafc"}
      strokeWidth={shape.strokeWidth || 3}
      fill={shape.stroke || "#f8fafc"}
      pointerLength={15}
      pointerWidth={15}
      rotation={shape.rotation}
      scaleX={shape.scaleX}
      scaleY={shape.scaleY}
      x={shape.x}
      y={shape.y}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
