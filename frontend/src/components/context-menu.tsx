import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "../store/useCanvasStore";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const {
    selectedShapeId,
    shapes,
    addShape,
    removeShape,
    reorderShape,
    saveHistory,
    setSelectedShapeId
  } = useCanvasStore();

  const selectedShape = shapes.find(s => s.id === selectedShapeId);

  const duplicate = () => {
    if (!selectedShape) return;
    saveHistory();
    const newId = uuidv4();
    const newShape = {
      ...JSON.parse(JSON.stringify(selectedShape)),
      id: newId,
      x: selectedShape.x + 20,
      y: selectedShape.y + 20,
    };
    addShape(newShape);
    setSelectedShapeId(newId);
    onClose();
  };

  const menuItems = [
    {
      label: "Duplicate",
      icon: <Copy size={14} />,
      onClick: duplicate,
      disabled: !selectedShape,
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      onClick: () => {
        if (selectedShapeId) {
          saveHistory();
          removeShape(selectedShapeId);
          onClose();
        }
      },
      disabled: !selectedShape,
      variant: "danger",
    },
    { divider: true },
    {
      label: "Bring to Front",
      icon: <ChevronUp size={14} />,
      onClick: () => {
        if (selectedShapeId) {
          saveHistory();
          reorderShape(selectedShapeId, "top");
          onClose();
        }
      },
      disabled: !selectedShape,
    },
    {
      label: "Send to Back",
      icon: <ChevronDown size={14} />,
      onClick: () => {
        if (selectedShapeId) {
          saveHistory();
          reorderShape(selectedShapeId, "bottom");
          onClose();
        }
      },
      disabled: !selectedShape,
    },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 pointer-events-auto"
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      <div
        className="fixed z-[60] w-48 glass-panel border border-white/10 rounded-xl shadow-2xl py-1 cursor-default animate-in fade-in zoom-in-95 duration-100"
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item, i) => (
          item.divider ? (
            <div key={i} className="h-px bg-white/5 my-1 mx-2" />
          ) : (
            <button
              key={i}
              disabled={item.disabled}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3 py-2 text-[11px] font-medium transition-all ${
                item.disabled
                  ? "opacity-30 cursor-not-allowed"
                  : item.variant === "danger"
                    ? "text-error hover:bg-error/10"
                    : "text-text-primary hover:bg-white/5"
              }`}
            >
              <span className={item.variant === "danger" ? "text-error" : "text-accent"}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        ))}
      </div>
    </>
  );
}
