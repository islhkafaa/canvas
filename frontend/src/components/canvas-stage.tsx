import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "../store/useCanvasStore";
import { EllipseShape } from "./shapes/ellipse-shape";
import { PenShape } from "./shapes/pen-shape";
import { RectShape } from "./shapes/rect-shape";

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    tool,
    shapes,
    isDrawing,
    selectedShapeId,
    stageConfig,
    setIsDrawing,
    addShape,
    updateShape,
    setSelectedShapeId,
    setStageConfig,
  } = useCanvasStore();

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
    if (selectedShapeId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedShapeId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedShapeId, shapes]);

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
        stroke: tool === "eraser" ? "eraser" : "#f8fafc",
        strokeWidth: tool === "eraser" ? 20 : 3,
      });
    } else if (tool === "rect") {
      addShape({
        ...baseShape,
        type: "rect",
        width: 0,
        height: 0,
        stroke: "#8b5cf6",
      });
    } else if (tool === "ellipse") {
      addShape({
        ...baseShape,
        type: "ellipse",
        radiusX: 0,
        radiusY: 0,
        stroke: "#8b5cf6",
      });
    }
  };

  const handlePointerMove = () => {
    if (!isDrawing || tool === "select" || tool === "pan") return;

    const pos = getPointerPos();
    if (!pos) return;

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
      case "rect":
      case "ellipse":
        return "cursor-[url('https://api.iconify.design/lucide:pencil.svg?color=white&width=24&height=24')_0_24,_auto]";
      case "eraser":
        return "cursor-[url('https://api.iconify.design/lucide:eraser.svg?color=white&width=24&height=24')_0_24,_auto]";
      default:
        return "cursor-crosshair";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-stage flex-1 overflow-hidden bg-bg canvas-grid relative ${getCursorClass()}`}
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
        onDragEnd={(e) => {
          if (tool === "pan") {
            setStageConfig({ x: e.target.x(), y: e.target.y() });
          } else {
            updateShape(e.target.id(), { x: e.target.x(), y: e.target.y() });
          }
        }}
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
        </Layer>
      </Stage>
    </div>
  );
}
