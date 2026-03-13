import { Download, Layers, Link } from "lucide-react";
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
  }, [roomParam]);

  useWebSocket(roomId);

  const handleExport = async () => {
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
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  return (
    <div className="canvas-app flex flex-col h-full w-full overflow-hidden bg-bg">
      <header className="h-12 shrink-0 flex items-center justify-between px-6 bg-surface border-b border-border/40 z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 group"
            title="Back to home"
          >
            <Layers className="w-5 h-5 text-accent shrink-0 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-semibold text-[13px] uppercase tracking-[0.12em] text-text-primary">
              Canvas
            </span>
          </button>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold text-text-primary/90 bg-surface-raised px-3 py-1 rounded-sm border border-border/30 tracking-[0.05em]">
              {roomId}
            </span>
            <button
              onClick={handleCopyLink}
              title="Copy room link"
              className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-surface-raised border border-border/30 text-[9px] font-bold tracking-widest text-text-secondary hover:text-text-primary hover:border-border/70 transition-all uppercase"
            >
              <Link size={9} />
              {copyToast ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserPresence />
          <button
            onClick={handleExport}
            title="Export canvas as JSON"
            className="flex items-center gap-2 px-3 py-1.5 bg-surface-raised border border-border/40 rounded-sm text-[9px] font-bold tracking-widest text-text-secondary hover:text-text-primary hover:border-border/80 transition-all duration-200 uppercase"
          >
            <Download size={10} />
            Export
          </button>
          <ConnectionBadge />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <CanvasStage />
      </div>
    </div>
  );
}
