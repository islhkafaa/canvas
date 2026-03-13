import {
  ArrowUpRight,
  Circle,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  Type,
  Undo2,
} from "lucide-react";
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
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "pan", label: "Pan", icon: Hand },
];

const DIVIDER_AFTER: Tool[] = ["select", "pan"];

export function Toolbar() {
  const activeTool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const historyStep = useCanvasStore((s) => s.historyStep);
  const historyLength = useCanvasStore((s) => s.history.length);

  const canUndo = historyStep > 0;
  const canRedo = historyStep < historyLength - 1;

  return (
    <aside className="tool-bar w-13 bg-surface border-r border-border/50 flex flex-col items-center py-4 gap-1.5 shrink-0 shadow-xl z-20 overflow-y-auto">
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        const Icon = tool.icon;
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
      </div>
    </aside>
  );
}
