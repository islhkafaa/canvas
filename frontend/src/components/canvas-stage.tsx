import Konva from "konva";
import { useEffect, useRef } from "react";

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stage = new Konva.Stage({
      container,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    const layer = new Konva.Layer();
    stage.add(layer);
    stageRef.current = stage;

    const handleResize = () => {
      stage.width(container.clientWidth);
      stage.height(container.clientHeight);
      layer.draw();
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      stage.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="canvas-stage flex-1 overflow-hidden bg-bg canvas-grid cursor-crosshair relative"
    />
  );
}
