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
    <div className="min-h-screen w-full bg-bg flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Atmosphere - Simplified */}
      <div className="absolute inset-0 canvas-grid opacity-[0.1]" />
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center group transition-all duration-300 hover:scale-105">
            <Layers className="w-8 h-8 text-accent transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary mb-2">
              Canvas<span className="text-accent">.</span>
            </h1>
            <p className="text-sm text-text-secondary tracking-widest uppercase font-medium">
              Creative Collaborative Studio
            </p>
          </div>
        </div>

        {/* Join Card */}
        <div className="w-full glass-panel p-8 rounded-3xl transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-2 font-display">
              Initialize Session
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Enter a room name to begin your collaborative journey.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-1">
                Room Identifier
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && join()}
                    placeholder="e.g. design-sprint"
                    spellCheck={false}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-secondary/30 outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>
                <button
                  onClick={() => setRoomId(generateRoomId())}
                  title="Generate random room ID"
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Shuffle size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={join}
              disabled={!roomId.trim()}
              className="group relative w-full overflow-hidden rounded-xl bg-accent px-6 py-4 text-sm font-bold text-bg transition-all hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <div className="flex items-center justify-center gap-2 relative z-10">
                Enter Studio
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-text-secondary/40 font-medium tracking-wide uppercase">
          Real-time sync • End-to-end creative flow
        </p>
      </div>
    </div>
  );
}
