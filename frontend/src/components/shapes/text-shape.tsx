import { Text } from "react-konva";
import type { TextShape as TextShapeType } from "../../types/websocket";

interface TextShapeProps {
  shape: TextShapeType;
  isSelected: boolean;
  onSelect: () => void;
  onDoubleClick?: () => void;
}

export function TextShape({
  shape,
  isSelected,
  onSelect,
  onDoubleClick,
}: TextShapeProps) {
  return (
    <Text
      id={shape.id}
      text={shape.text}
      fontSize={shape.fontSize}
      fontFamily={shape.fontFamily}
      fill={shape.fill}
      rotation={shape.rotation}
      scaleX={shape.scaleX}
      scaleY={shape.scaleY}
      x={shape.x}
      y={shape.y}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDoubleClick}
      onDblTap={onDoubleClick}
    />
  );
}
