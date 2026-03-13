import { Globe } from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";

const config = {
  connected: {
    label: "Connected",
    className: "bg-success",
    iconColor: "text-success",
  },
  connecting: {
    label: "Connecting...",
    className: "bg-warning",
    iconColor: "text-warning",
  },
  disconnected: {
    label: "Disconnected",
    className: "bg-error",
    iconColor: "text-error",
  },
};

export function ConnectionBadge() {
  const status = useCanvasStore((s) => s.connectionStatus);
  const { label, iconColor } = config[status];

  return (
    <div className="connection-badge flex items-center gap-2 px-3 py-1.5 bg-surface-raised border border-border/40 rounded-sm text-[9px] font-bold tracking-widest transition-all duration-300 leading-none">
      <Globe size={10} className={iconColor} />
      <span className={`uppercase pt-px ${iconColor}`}>{label}</span>
    </div>
  );
}
