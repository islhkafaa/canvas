import { useCanvasStore } from "../store/useCanvasStore";

export function UserPresence() {
  const { peers, myUserId } = useCanvasStore();

  const activeUsers = Object.entries(peers);
  const displayLimit = 4;
  const visibleUsers = activeUsers.slice(0, displayLimit);
  const extraCount = Math.max(0, activeUsers.length - displayLimit);

  const totalUsers = activeUsers.length + (myUserId ? 1 : 0);

  if (totalUsers <= 1) {
    return (
      <div className="flex items-center text-xs text-text-muted font-medium mr-4">
        Only you here
      </div>
    );
  }

  return (
    <div className="flex items-center mr-4">
      <div className="flex -space-x-2 mr-3">
        {myUserId && (
          <div
            className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold text-white relative z-10"
            style={{ backgroundColor: "#4b5563" }}
            title="You"
          >
            {myUserId.substring(0, 2).toUpperCase()}
          </div>
        )}

        {visibleUsers.map(([id, data], i) => (
          <div
            key={id}
            className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold text-white relative"
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
            className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-bold text-white relative bg-surface-raised"
            style={{ zIndex: 0 }}
          >
            +{extraCount}
          </div>
        )}
      </div>

      <div className="text-xs text-text-primary font-medium">
        {totalUsers} Active
      </div>
    </div>
  );
}
