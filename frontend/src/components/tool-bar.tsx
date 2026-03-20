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
  { id: "select", label: "Select (V)", icon: MousePointer2 },
  { id: "pan", label: "Hand (H)", icon: Hand },
  { id: "pen", label: "Pen (P)", icon: Pencil },
  { id: "rect", label: "Rectangle (R)", icon: Square },
  { id: "ellipse", label: "Ellipse (O)", icon: Circle },
  { id: "arrow", label: "Arrow (A)", icon: ArrowUpRight },
  { id: "text", label: "Text (T)", icon: Type },
  { id: "image", label: "Image (I)", icon: Image },
  { id: "eraser", label: "Eraser (E)", icon: Eraser },
];

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
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-40">
      {/* Tool Group */}
      <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          const Icon = tool.icon;

          if (tool.id === "image") {
            return (
              <div key={tool.id} className="relative group">
                <button
                  title={tool.label}
                  onClick={() =>
                    document.getElementById("image-upload-input")?.click()
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/5 text-text-secondary hover:text-text-primary active:scale-90"
                >
                  <Icon size={18} strokeWidth={2} />
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
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              title={tool.label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
                isActive
                  ? "bg-accent text-bg shadow-md"
                  : "bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          );
        })}

        <div className="w-6 h-px bg-white/10 my-1 mx-auto" />

        <button
          onClick={() => colorInputRef.current?.click()}
          title="Color Picker"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/5 active:scale-95 relative overflow-hidden"
        >
          <div
            className="w-5 h-5 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-zinc-900 shadow-sm"
            style={{ backgroundColor: strokeColor }}
          />
          <input
            ref={colorInputRef}
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </button>
      </div>

      {/* History & Action Group */}
      <div className="glass-panel p-1.5 rounded-2xl flex flex-col gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/5 text-text-secondary hover:text-text-primary disabled:opacity-20 active:scale-95"
        >
          <Undo2 size={18} strokeWidth={2} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/5 text-text-secondary hover:text-text-primary disabled:opacity-20 active:scale-95"
        >
          <Redo2 size={18} strokeWidth={2} />
        </button>

        <div className="w-6 h-px bg-white/10 my-1 mx-auto" />

        <button
          onClick={() => {
            if (window.confirm("Clear all shapes?")) {
              clearShapes();
            }
          }}
          title="Clear Canvas"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-error/10 text-text-secondary hover:text-error active:scale-95"
        >
          <Trash2 size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
