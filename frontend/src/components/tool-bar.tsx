import { useCanvasStore, type Tool } from "../store/useCanvasStore";

interface ToolDef {
  id: Tool;
  label: string;
  icon: string;
}

const tools: ToolDef[] = [
  { id: "select", label: "Select", icon: "M3 3l7 18 3-7 7-3L3 3z" },
  {
    id: "pen",
    label: "Pen",
    icon: "M15.232 5.232l3.536 3.536M9 11l6.364-6.364a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z",
  },
  {
    id: "shapes",
    label: "Shapes",
    icon: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  },
  {
    id: "text",
    label: "Text",
    icon: "M4 6h16M4 12h10M4 18h7",
  },
  {
    id: "eraser",
    label: "Eraser",
    icon: "M6.5 17H20M5 12.5L10.5 7m5 5L10.5 7m0 0L7 3.5A1.5 1.5 0 005 5v0a1.5 1.5 0 001.5 1.5h0L10.5 7z",
  },
  {
    id: "pan",
    label: "Pan",
    icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11",
  },
];

const DIVIDER_AFTER: Tool[] = ["select"];

export function Toolbar() {
  const activeTool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);

  return (
    <aside className="tool-bar w-13 bg-surface border-r border-border/50 flex flex-col items-center py-4 gap-1.5 shrink-0 shadow-xl">
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tool.icon} />
              </svg>
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
