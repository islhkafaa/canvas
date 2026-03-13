import { useCanvasStore } from "../store/useCanvasStore";

const config = {
  connected: { label: "Connected", className: "bg-success" },
  connecting: { label: "Connecting...", className: "bg-warning" },
  disconnected: { label: "Disconnected", className: "bg-error" },
};

export function ConnectionBadge() {
  const status = useCanvasStore((s) => s.connectionStatus);
  const { label, className } = config[status];

  return (
    <div className="connection-badge flex items-center gap-2.5 px-3 py-1.5 bg-surface-raised border border-border/40 rounded-sm text-[9px] font-bold tracking-widest transition-all duration-300 leading-none">
      <span
        className={`w-1 h-1 rounded-full shrink-0 transition-all duration-500 ${className}`}
      />
      <span
        className={`uppercase pt-px ${status === "connected" ? "text-success" : status === "connecting" ? "text-warning" : "text-error"}`}
      >
        {label}
      </span>
    </div>
  );
}
