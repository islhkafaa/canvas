import { Download, Hash, HelpCircle, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CanvasStage } from "../components/canvas-stage";
import { ConnectionBadge } from "../components/connection-badge";
import { LayersPanel } from "../components/layers-panel";
import { ShortcutsModal } from "../components/shortcuts-modal";
import { Toolbar } from "../components/tool-bar";
import { UserPresence } from "../components/user-presence";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCanvasStore } from "../store/useCanvasStore";

export function CanvasPage() {
  const { roomId: roomParam } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const setRoomId = useCanvasStore((s) => s.setRoomId);
  const roomId = useCanvasStore((s) => s.roomId);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    if (!roomParam) {
      navigate("/");
      return;
    }
    setRoomId(roomParam);
  }, [roomParam, navigate, setRoomId]);

  useWebSocket(roomId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExport = async () => {
    try {
      const res = await fetch(`http://localhost:3001/rooms/${roomId}/export`);
      const shapes = await res.json();
      const blob = new Blob([JSON.stringify(shapes, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canvas-${roomId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text-primary overflow-hidden font-sans">
      <header className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 w-full max-w-fit px-6 box-border">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-6 shadow-2xl border-white/5">
          <div className="flex items-center gap-3 pr-6 border-r border-white/5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Layers size={18} />
            </div>
            <h1 className="font-display font-bold text-sm tracking-tight hidden md:block">Studio</h1>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all active:scale-95 group relative"
              onClick={handleCopyLink}
            >
              <Hash size={12} className="text-text-secondary group-hover:text-accent transition-colors" />
              <span className="text-[11px] font-bold text-text-secondary group-hover:text-text-primary transition-colors uppercase tracking-widest">{roomId}</span>
              {copyToast && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent bg-zinc-900 px-3 py-1.5 rounded-lg border border-accent/20 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                  Room ID Copied
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-6 shadow-2xl border-white/5">
          <UserPresence />
          <div className="w-px h-4 bg-white/5" />
          <ConnectionBadge />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="glass-panel w-10 h-10 rounded-2xl flex items-center justify-center text-text-secondary hover:text-accent hover:bg-white/5 transition-all shadow-2xl border-white/5 active:scale-95"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={18} />
          </button>

          <button
            onClick={handleExport}
            className="glass-panel h-10 px-4 rounded-2xl flex items-center gap-2 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all shadow-2xl border-white/5 active:scale-95"
          >
            <Download size={16} />
            <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">Export</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        <Toolbar />
        <LayersPanel />
        <CanvasStage />
      </main>

      {isShortcutsOpen && (
        <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />
      )}
    </div>
  );
}
