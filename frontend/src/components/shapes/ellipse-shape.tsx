import { Ellipse } from "react-konva";
import type { EllipseShape } from "../../store/useCanvasStore";

interface Props {
  shape: EllipseShape;
  isSelected: boolean;
  onSelect: () => void;
}

export function EllipseShape({ shape, isSelected, onSelect }: Props) {
  return (
    <Ellipse
      id={shape.id}
      x={shape.x}
      y={shape.y}
      radiusX={shape.radiusX}
      radiusY={shape.radiusY}
      fill={shape.fill || "transparent"}
      stroke={shape.stroke || "#8b5cf6"}
      strokeWidth={shape.strokeWidth || 3}
      rotation={shape.rotation || 0}
      scaleX={shape.scaleX || 1}
      scaleY={shape.scaleY || 1}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}
