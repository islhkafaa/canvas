import Konva from "konva";
import React, { useEffect, useRef, useState } from "react";
import {
  Group,
  Image as KonvaImage,
  Layer,
  Path,
  Stage,
  Text,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import { useCursorBroadcaster } from "../hooks/useCursorBroadcaster";
import { useCanvasStore } from "../store/useCanvasStore";
import type { Shape } from "../types/websocket";
import { ArrowShape } from "./shapes/arrow-shape";
import { EllipseShape } from "./shapes/ellipse-shape";
import { PenShape } from "./shapes/pen-shape";
import { RectShape } from "./shapes/rect-shape";
import { TextShape } from "./shapes/text-shape";

function ImageShapeComponent({
  shape,
  isSelected,
  onSelect,
}: {
  shape: Extract<Shape, { type: "image" }>;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [image] = useImage(shape.dataUrl);
  return (
    <KonvaImage
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      scaleX={shape.scaleX || 1}
      scaleY={shape.scaleY || 1}
      rotation={shape.rotation || 0}
      image={image}
      draggable={isSelected}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const emitCursor = useCursorBroadcaster();

  const {
    tool,
    shapes,
    peers,
    myUserId,
    isDrawing,
    selectedShapeId,
    stageConfig,
    strokeColor,
    setIsDrawing,
    addShape,
    updateShape,
    removeShape,
    reorderShape,
    setSelectedShapeId,
    setStageConfig,
    saveHistory,
    undo,
    redo,
  } = useCanvasStore();

  const editingTextShape = editingTextId
    ? (shapes.find((s) => s.id === editingTextId && s.type === "text") as any)
    : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedShapeId: sid } = useCanvasStore.getState();
        if (sid) {
          saveHistory();
          removeShape(sid);
        }
      } else if (e.key === "[") {
        const { selectedShapeId: sid } = useCanvasStore.getState();
        if (sid) {
          saveHistory();
          reorderShape(sid, "down");
        }
      } else if (e.key === "]") {
        const { selectedShapeId: sid } = useCanvasStore.getState();
        if (sid) {
          saveHistory();
          reorderShape(sid, "up");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, removeShape, saveHistory, reorderShape]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedShapeId && transformerRef.current) {
      const selectedNode = stageRef.current?.findOne("#" + selectedShapeId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedShapeId]);

  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return null;

    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY(),
    };
  };

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (tool === "pan") return;

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty && selectedShapeId) {
      setSelectedShapeId(null);
    }

    if (tool === "select") return;

    const pos = getPointerPos();
    if (!pos) return;

    setIsDrawing(true);
    saveHistory();

    const baseShape = {
      id: uuidv4(),
      x: pos.x,
      y: pos.y,
    };

    if (tool === "pen" || tool === "eraser") {
      addShape({
        id: uuidv4(),
        x: 0,
        y: 0,
        type: "pen",
        points: [pos.x, pos.y],
        stroke: tool === "eraser" ? "eraser" : strokeColor,
        strokeWidth: tool === "eraser" ? 20 : 3,
      });
    } else if (tool === "rect") {
      addShape({
        ...baseShape,
        type: "rect",
        width: 0,
        height: 0,
        stroke: strokeColor,
      });
    } else if (tool === "ellipse") {
      addShape({
        ...baseShape,
        type: "ellipse",
        radiusX: 0,
        radiusY: 0,
        stroke: strokeColor,
      });
    } else if (tool === "arrow") {
      addShape({
        ...baseShape,
        type: "arrow",
        points: [0, 0, 0, 0],
        stroke: strokeColor,
        strokeWidth: 3,
      });
    } else if (tool === "text") {
      const id = uuidv4();
      addShape({
        id,
        x: pos.x,
        y: pos.y,
        type: "text",
        text: "",
        fontSize: 24,
        fontFamily: "Inter, sans-serif",
        fill: "#f8fafc",
      });
      setIsDrawing(false);
      setTimeout(() => setEditingTextId(id), 0);
    }
  };

  const handlePointerMove = () => {
    const pos = getPointerPos();
    if (!pos) return;

    if (tool !== "pan") {
      emitCursor(pos.x, pos.y);
    }

    if (!isDrawing || tool === "select" || tool === "pan") return;

    const lastShape = shapes[shapes.length - 1];
    if (!lastShape) return;

    if (tool === "pen" || tool === "eraser") {
      if (lastShape.type === "pen") {
        const newPoints = [...lastShape.points, pos.x, pos.y];
        updateShape(lastShape.id, {
          points: newPoints,
        });
      }
    } else if (tool === "rect") {
      if (lastShape.type === "rect") {
        updateShape(lastShape.id, {
          width: pos.x - lastShape.x,
          height: pos.y - lastShape.y,
        });
      }
    } else if (tool === "ellipse") {
      if (lastShape.type === "ellipse") {
        updateShape(lastShape.id, {
          radiusX: Math.abs(pos.x - lastShape.x),
          radiusY: Math.abs(pos.y - lastShape.y),
        });
      }
    } else if (tool === "arrow") {
      if (lastShape.type === "arrow") {
        updateShape(lastShape.id, {
          points: [0, 0, pos.x - lastShape.x, pos.y - lastShape.y],
        });
      }
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageConfig({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const getCursorClass = () => {
    switch (tool) {
      case "pan":
        return "cursor-grab active:cursor-grabbing";
      case "select":
        return "cursor-default";
      case "text":
        return "cursor-text";
      case "pen":
      case "arrow":
      case "rect":
      case "ellipse":
        return "cursor-[url('https://api.iconify.design/lucide:pencil.svg?color=white&width=24&height=24')_0_24,_auto]";
      case "eraser":
        return "cursor-[url('https://api.iconify.design/lucide:eraser.svg?color=white&width=24&height=24')_0_24,_auto]";
      default:
        return "cursor-crosshair";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    stage.setPointersPositions(e);
    const pos = getPointerPos();
    if (!pos) return;

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width *= ratio;
              height *= ratio;
            }

            saveHistory();
            addShape({
              id: uuidv4(),
              type: "image",
              x: pos.x - width / 2,
              y: pos.y - height / 2,
              width,
              height,
              dataUrl,
            });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-stage flex-1 overflow-hidden bg-bg canvas-grid relative ${getCursorClass()}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stageConfig.x}
        y={stageConfig.y}
        scaleX={stageConfig.scale}
        scaleY={stageConfig.scale}
        draggable={tool === "pan"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onDragStart={() => {
          if (tool !== "pan") saveHistory();
        }}
        onDragEnd={(e) => {
          if (tool === "pan") {
            setStageConfig({ x: e.target.x(), y: e.target.y() });
          } else {
            updateShape(e.target.id(), { x: e.target.x(), y: e.target.y() });
          }
        }}
        onTransformStart={() => saveHistory()}
        onTransformEnd={(e) => {
          const node = e.target;
          updateShape(node.id(), {
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation(),
          });
        }}
      >
        <Layer>
          {shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId;
            const onSelect = () => {
              if (tool === "select") setSelectedShapeId(shape.id);
            };

            switch (shape.type) {
              case "pen":
                return (
                  <PenShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              case "rect":
                return (
                  <RectShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              case "ellipse":
                return (
                  <EllipseShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              case "arrow":
                return (
                  <ArrowShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              case "text":
                return (
                  <TextShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onDoubleClick={() => {
                      if (tool === "select" || tool === "text")
                        setEditingTextId(shape.id);
                    }}
                  />
                );
              case "image":
                return (
                  <ImageShapeComponent
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    onSelect={onSelect}
                  />
                );
              default:
                return null;
            }
          })}
          {selectedShapeId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
              anchorStyleFunc={(anchor) => {
                anchor.cornerRadius(10);
              }}
              borderStroke="#8b5cf6"
              anchorStroke="#8b5cf6"
              anchorFill="#121217"
            />
          )}

          {Object.entries(peers).map(([peerId, cursor]) => {
            if (peerId === myUserId) return null;
            return (
              <Group key={peerId} x={cursor.x} y={cursor.y}>
                <Path
                  data="M5.65376 17.9088L2.09104 2.11542C1.72895 0.50974 3.49023 -0.627768 4.8876 0.311749L17.5147 8.80214C18.914 9.74314 18.6654 11.8906 17.078 12.4214L11.751 14.2023C11.396 14.321 11.109 14.5807 10.9658 14.9198L8.43163 20.925C7.8188 22.3789 5.82024 22.0163 5.37813 18.9472L5.65376 17.9088Z"
                  fill={cursor.color}
                  stroke="white"
                  strokeWidth={1}
                />
                <Text
                  text={peerId.split("-")[0]}
                  x={12}
                  y={20}
                  fontSize={12}
                  fontFamily="monospace"
                  fill="white"
                  padding={4}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {editingTextShape && (
        <textarea
          autoFocus
          className="absolute z-50 bg-transparent border-none outline-none resize-none leading-none overflow-hidden whitespace-pre"
          style={{
            left: editingTextShape.x * stageConfig.scale + stageConfig.x,
            top: editingTextShape.y * stageConfig.scale + stageConfig.y,
            fontSize: editingTextShape.fontSize * stageConfig.scale,
            color: editingTextShape.fill,
            fontFamily: editingTextShape.fontFamily,
            transform: `rotate(${editingTextShape.rotation || 0}deg) scale(${editingTextShape.scaleX || 1}, ${editingTextShape.scaleY || 1})`,
            transformOrigin: "top left",
            minWidth: "100px",
            minHeight: "1em",
          }}
          defaultValue={editingTextShape.text}
          onBlur={(e) => {
            const newText = e.target.value.trim();
            if (newText === "" && editingTextShape.text === "") {
              removeShape(editingTextShape.id);
            } else {
              saveHistory();
              updateShape(editingTextShape.id, { text: e.target.value });
            }
            setEditingTextId(null);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              setEditingTextId(null);
            }
          }}
        />
      )}
    </div>
  );
}
