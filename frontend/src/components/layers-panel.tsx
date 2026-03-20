import { ChevronDown, ChevronUp, Eye, EyeOff, Layers as LayersIcon, Lock, Trash2, Unlock } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import type { Shape } from "../types/websocket";

export function LayersPanel() {
  const {
    shapes,
    selectedShapeId,
    setSelectedShapeId,
    reorderShape,
    toggleLock,
    toggleVisibility,
    removeShape,
    saveHistory
  } = useCanvasStore();

  const reversedShapes = [...shapes].reverse();

  const getShapeIcon = (type: Shape["type"]) => {
    switch (type) {
      case "rect": return "Rect";
      case "ellipse": return "Circ";
      case "pen": return "Draw";
      case "text": return "Text";
      case "arrow": return "Arw";
      case "image": return "Img";
      default: return "Obj";
    }
  };

  return (
    <div className="absolute right-6 top-32 w-64 glass-panel rounded-2xl flex flex-col max-h-[60vh] z-40 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <LayersIcon size={14} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-text-primary">
            Layers
          </span>
        </div>
        <span className="text-[10px] font-medium text-text-secondary bg-white/5 px-2 py-0.5 rounded-full">
          {shapes.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {reversedShapes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-40">
              No layers yet
            </p>
          </div>
        ) : (
          reversedShapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId;
            const isVisible = shape.isVisible !== false;
            const isLocked = shape.isLocked === true;

            return (
              <div
                key={shape.id}
                onClick={() => setSelectedShapeId(shape.id)}
                className={`group flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-accent/10 border border-accent/20"
                    : "hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[9px] font-bold uppercase tracking-tighter ${
                  isSelected ? "bg-accent text-bg" : "bg-white/5 text-text-secondary"
                }`}>
                  {getShapeIcon(shape.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-medium truncate ${isSelected ? "text-text-primary" : "text-text-secondary"}`}>
                    {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} Layer
                  </p>
                  <p className="text-[8px] text-text-secondary/40 truncate font-mono uppercase">
                    ID: {shape.id.substring(0, 8)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveHistory();
                      toggleVisibility(shape.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${!isVisible ? "text-accent bg-accent/10" : "text-text-secondary hover:text-text-primary hover:bg-white/5"}`}
                  >
                    {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveHistory();
                      toggleLock(shape.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${isLocked ? "text-warning bg-warning/10" : "text-text-secondary hover:text-text-primary hover:bg-white/5"}`}
                  >
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedShapeId && (
        <div className="p-3 bg-white/[0.03] border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex gap-1">
             <button
              onClick={() => {
                saveHistory();
                reorderShape(selectedShapeId, "down");
              }}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              title="Move Down"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => {
                saveHistory();
                reorderShape(selectedShapeId, "up");
              }}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              title="Move Up"
            >
              <ChevronUp size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              saveHistory();
              removeShape(selectedShapeId);
            }}
            className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-all"
            title="Delete Layer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
