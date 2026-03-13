import { Layers } from "lucide-react";
import { CanvasStage } from "./components/canvas-stage";
import { ConnectionBadge } from "./components/connection-badge";
import { Toolbar } from "./components/tool-bar";
import { UserPresence } from "./components/user-presence";
import { useWebSocket } from "./hooks/useWebSocket";
import { useCanvasStore } from "./store/useCanvasStore";

function App() {
  const roomId = useCanvasStore((s) => s.roomId);
  useWebSocket(roomId);

  return (
    <div className="canvas-app flex flex-col h-full w-full overflow-hidden bg-bg">
      <header className="h-12 shrink-0 flex items-center justify-between px-6 bg-surface border-b border-border/40 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 group">
            <Layers className="w-5 h-5 text-accent shrink-0 transition-transform duration-300 group-hover:scale-105" />
            <span className="font-semibold text-[13px] uppercase tracking-[0.12em] text-text-primary">
              Canvas
            </span>
          </div>
          <div className="h-4 w-px bg-border/60" />
          <div className="flex items-center">
            <span className="text-[10px] font-mono font-semibold text-text-primary/90 bg-surface-raised px-3 py-1 rounded-sm border border-border/30 tracking-[0.05em]">
              {roomId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserPresence />
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

export default App;
