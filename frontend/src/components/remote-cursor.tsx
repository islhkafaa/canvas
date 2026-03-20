import { Group, Path, Text } from "react-konva";

interface RemoteCursorProps {
  id: string;
  x: number;
  y: number;
  color: string;
}

export function RemoteCursor({ id, x, y, color }: RemoteCursorProps) {
  const label = id.split("-")[0].substring(0, 4).toUpperCase();

  return (
    <Group x={x} y={y} listening={false}>
      <Path
        data="M5.65376 17.9088L2.09104 2.11542C1.72895 0.50974 3.49023 -0.627768 4.8876 0.311749L17.5147 8.80214C18.914 9.74314 18.6654 11.8906 17.078 12.4214L11.751 14.2023C11.396 14.321 11.109 14.5807 10.9658 14.9198L8.43163 20.925C7.8188 22.3789 5.82024 22.0163 5.37813 18.9472L5.65376 17.9088Z"
        fill={color}
        stroke="#09090b"
        strokeWidth={1.5}
        scale={{ x: 0.8, y: 0.8 }}
      />
      <Group x={12} y={16}>
        <Text
          text={label}
          fontSize={10}
          fontFamily="'Outfit', sans-serif"
          fontStyle="bold"
          fill="white"
          padding={4}
          offsetX={0}
          offsetY={0}
          listening={false}
          background={color}
        />
      </Group>
    </Group>
  );
}
