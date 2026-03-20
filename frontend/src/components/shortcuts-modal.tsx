import { ArrowRight, Circle, Command, Eraser, Layers, MousePointer2, Move, Pencil, Redo2, Square, Trash2, Type, Undo2, X } from "lucide-react";

interface ShortcutsModalProps {
  onClose: () => void;
}

export function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const shortcutGroups = [
    {
      title: "Tools",
      items: [
        { key: "V", label: "Select Tool", icon: <MousePointer2 size={14} /> },
        { key: "P", label: "Pen Tool", icon: <Pencil size={14} /> },
        { key: "T", label: "Text Tool", icon: <Type size={14} /> },
        { key: "R", label: "Rectangle", icon: <Square size={14} /> },
        { key: "O", label: "Ellipse", icon: <Circle size={14} /> },
        { key: "A", label: "Arrow", icon: <ArrowRight size={14} /> },
        { key: "E", label: "Eraser", icon: <Eraser size={14} /> },
        { key: "M", label: "Pan / Move", icon: <Move size={14} /> },
      ],
    },
    {
      title: "Actions",
      items: [
        { key: "Ctrl + Z", label: "Undo", icon: <Undo2 size={14} /> },
        { key: "Ctrl + Y", label: "Redo", icon: <Redo2 size={14} /> },
        { key: "Del / BS", label: "Delete Selection", icon: <Trash2 size={14} /> },
        { key: "[", label: "Send Backward", icon: <Layers size={14} className="rotate-180" /> },
        { key: "]", label: "Bring Forward", icon: <Layers size={14} /> },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl glass-panel border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Command size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary font-display">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-text-secondary uppercase tracking-widest font-medium">Master the Studio workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="text-accent group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <kbd className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-white/10 text-[10px] font-bold text-text-primary font-mono shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white/[0.03] border-t border-white/5 text-center">
          <p className="text-[11px] text-text-secondary/40 font-medium uppercase tracking-wide">
            Efficiency is the key to creativity
          </p>
        </div>
      </div>
    </div>
  );
}
