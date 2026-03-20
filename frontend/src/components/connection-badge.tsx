import { useCanvasStore } from "../store/useCanvasStore";

const config = {
  connected: {
    label: "Live",
    className: "bg-success",
    dotClass: "bg-success",
  },
  connecting: {
    label: "Syncing",
    className: "bg-warning",
    dotClass: "bg-warning animate-pulse",
  },
  disconnected: {
    label: "Offline",
    className: "bg-error",
    dotClass: "bg-error",
  },
};

export function ConnectionBadge() {
  const status = useCanvasStore((s) => s.connectionStatus);
  const { label, dotClass } = config[status];

  return (
    <div className="flex items-center gap-2 px-1 transition-all duration-500">
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.15em]">
        {label}
      </span>
    </div>
  );
}
