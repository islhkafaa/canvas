import {
  ArrowUpRight,
  Circle,
  Eraser,
  Hand,
  Image,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore, type Tool } from "../store/useCanvasStore";

interface ToolDef {
  id: Tool;
  label: string;
  icon: any;
}

const tools: ToolDef[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "pen", label: "Pen", icon: Pencil },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: Circle },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: Image },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "pan", label: "Pan", icon: Hand },
];

const DIVIDER_AFTER: Tool[] = ["select", "pan"];

export function Toolbar() {
  const activeTool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const clearShapes = useCanvasStore((s) => s.clearShapes);
  const strokeColor = useCanvasStore((s) => s.strokeColor);
  const setStrokeColor = useCanvasStore((s) => s.setStrokeColor);
  const historyStep = useCanvasStore((s) => s.historyStep);
  const historyLength = useCanvasStore((s) => s.history.length);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const canUndo = historyStep > 0;
  const canRedo = historyStep < historyLength - 1;

  return (
    <aside className="tool-bar w-13 bg-surface border-r border-border/50 flex flex-col items-center py-4 gap-1.5 shrink-0 shadow-xl z-20 overflow-y-auto">
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        const Icon = tool.icon;

        if (tool.id === "image") {
          return (
            <div key={tool.id} className="contents relative">
              <button
                title="Add Image"
                onClick={() =>
                  document.getElementById("image-upload-input")?.click()
                }
                className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-raised bg-transparent text-text-secondary hover:text-text-primary`}
              >
                <Icon size={18} strokeWidth={1.75} />
              </button>
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      const img = new window.Image();
                      img.onload = () => {
                        const maxWidth = 800;
                        const maxHeight = 800;
                        let width = img.width;
                        let height = img.height;

                        if (width > maxWidth || height > maxHeight) {
                          const ratio = Math.min(
                            maxWidth / width,
                            maxHeight / height,
                          );
                          width *= ratio;
                          height *= ratio;
                        }

                        const { stageConfig, addShape, saveHistory } =
                          useCanvasStore.getState();
                        const centerX =
                          (window.innerWidth / 2 - stageConfig.x) /
                          stageConfig.scale;
                        const centerY =
                          (window.innerHeight / 2 - stageConfig.y) /
                          stageConfig.scale;

                        saveHistory();
                        addShape({
                          id: uuidv4(),
                          type: "image",
                          x: centerX - width / 2,
                          y: centerY - height / 2,
                          width,
                          height,
                          dataUrl,
                        });
                      };
                      img.src = dataUrl;
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          );
        }

        return (
          <div key={tool.id} className="contents">
            <button
              onClick={() => setTool(tool.id)}
              title={tool.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-raised ${
                isActive
                  ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(139,92,246,0.3)]"
                  : "bg-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
            </button>
            {DIVIDER_AFTER.includes(tool.id) && (
              <div className="w-7 h-px bg-border my-1.5 mx-auto" />
            )}
          </div>
        );
      })}

      <div className="w-7 h-px bg-border my-1.5 mx-auto" />

      <button
        onClick={() => colorInputRef.current?.click()}
        title="Stroke colour"
        className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer hover:bg-surface-raised transition-all duration-200 relative"
      >
        <div
          className="w-5 h-5 rounded-full ring-2 ring-white/20 ring-offset-1 ring-offset-surface"
          style={{ backgroundColor: strokeColor }}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          title="Stroke colour"
        />
      </button>

      <div className="flex-1" />

      <div className="contents">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-raised text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 size={18} strokeWidth={1.75} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-raised text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 size={18} strokeWidth={1.75} />
        </button>
        <div className="w-7 h-px bg-border my-1.5 mx-auto" />
        <button
          onClick={() => {
            if (window.confirm("Clear all shapes in this room?")) {
              clearShapes();
            }
          }}
          title="Clear canvas"
          className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 hover:bg-error/10 hover:text-error text-text-secondary"
        >
          <Trash2 size={18} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
