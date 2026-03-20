import { Download, Home, Layers, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CanvasStage } from "../components/canvas-stage";
import { ConnectionBadge } from "../components/connection-badge";
import { Toolbar } from "../components/tool-bar";
import { UserPresence } from "../components/user-presence";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCanvasStore } from "../store/useCanvasStore";

export function CanvasPage() {
  const { roomId: roomParam } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
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
    <div className="canvas-app relative flex flex-col h-full w-full overflow-hidden bg-bg font-sans">
      {/* Floating Header */}
      <header className="absolute top-4 left-0 right-0 px-6 z-50 pointer-events-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
              title="Back to home"
            >
              <Home className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
            </button>
            <div className="h-10 glass-panel px-4 rounded-xl flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <span className="font-display font-bold text-sm tracking-tight text-text-primary">
                  Canvas
                </span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-accent/80 bg-accent/5 px-2 py-0.5 rounded-md border border-accent/20">
                  {roomId}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary transition-all uppercase"
                >
                  <Link size={10} />
                  {copyToast ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 glass-panel px-3 rounded-xl flex items-center gap-4">
              <UserPresence />
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold tracking-wider text-text-secondary hover:text-text-primary transition-all uppercase"
              >
                <Download size={12} />
                Export
              </button>
            </div>
            <div className="h-10 glass-panel px-4 rounded-xl flex items-center justify-center">
              <ConnectionBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden relative">
        <Toolbar />
        <CanvasStage />
      </main>
    </div>
  );
}
