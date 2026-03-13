import {
  Circle,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Square,
  Type,
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
  { id: "text", label: "Text", icon: Type },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "pan", label: "Pan", icon: Hand },
];

const DIVIDER_AFTER: Tool[] = ["select"];

export function Toolbar() {
  const activeTool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);

  return (
    <aside className="tool-bar w-13 bg-surface border-r border-border/50 flex flex-col items-center py-4 gap-1.5 shrink-0 shadow-xl">
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
    </aside>
  );
}
