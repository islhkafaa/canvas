import { getRandomColor, useCanvasStore } from "../store/useCanvasStore";

export function UserPresence() {
  const { peers, myUserId } = useCanvasStore();

  const activeUsers = Object.entries(peers);
  const displayLimit = 4;
  const visibleUsers = activeUsers.slice(0, displayLimit);
  const extraCount = Math.max(0, activeUsers.length - displayLimit);

  const totalUsers = activeUsers.length + (myUserId ? 1 : 0);

  if (totalUsers <= 1) {
    return (
      <div className="flex items-center text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">
        Solo Session
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {myUserId && (
          <div
            className="w-7 h-7 rounded-lg border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white relative z-20 group cursor-default transition-transform hover:scale-110"
            style={{ backgroundColor: getRandomColor(myUserId) }}
            title="You"
          >
            {myUserId.substring(0, 2).toUpperCase()}
          </div>
        )}

        {visibleUsers.map(([id, data], i) => (
          <div
            key={id}
            className="w-7 h-7 rounded-lg border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white relative transition-transform hover:scale-110"
            style={{
              backgroundColor: data.color,
              zIndex: 10 - i,
            }}
            title={`User ${id.substring(0, 4)}`}
          >
            {id.substring(0, 2).toUpperCase()}
          </div>
        ))}

        {extraCount > 0 && (
          <div
            className="w-7 h-7 rounded-lg border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-text-secondary bg-zinc-800 relative z-0"
          >
            +{extraCount}
          </div>
        )}
      </div>

      <div className="ml-3 text-[10px] font-bold text-text-primary uppercase tracking-tight">
        {totalUsers} <span className="text-text-secondary font-medium">Team</span>
      </div>
    </div>
  );
}
