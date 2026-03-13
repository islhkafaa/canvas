import { ArrowRight, Layers, Shuffle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function generateRoomId() {
  return uuidv4().split("-")[0];
}

export function HomePage() {
  const [roomId, setRoomId] = useState(generateRoomId);
  const navigate = useNavigate();

  const join = () => {
    const id = roomId.trim();
    if (!id) return;
    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen w-full bg-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 canvas-grid opacity-40" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="font-semibold text-base uppercase tracking-[0.14em] text-text-primary leading-none">
              Canvas
            </div>
            <div className="text-[11px] text-text-secondary tracking-wide mt-0.5">
              Real-time collaborative whiteboard
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border/60 rounded-xl p-6 shadow-2xl">
          <h1 className="text-lg font-semibold text-text-primary mb-1">
            Start collaborating
          </h1>
          <p className="text-[13px] text-text-secondary mb-6">
            Enter a room name to create or join an existing session.
          </p>

          <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-widest mb-2">
            Room Name
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="e.g. design-sprint"
              spellCheck={false}
              className="flex-1 bg-surface-raised border border-border/60 rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-all"
            />
            <button
              onClick={() => setRoomId(generateRoomId())}
              title="Generate random room ID"
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-surface-raised border border-border/60 text-text-secondary hover:text-text-primary hover:border-border transition-all"
            >
              <Shuffle size={15} />
            </button>
          </div>

          <button
            onClick={join}
            disabled={!roomId.trim()}
            className="w-full flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-accent/20"
          >
            Join Room
            <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-center text-[11px] text-text-secondary/50 mt-6">
          Rooms are created automatically on first join.
        </p>
      </div>
    </div>
  );
}
