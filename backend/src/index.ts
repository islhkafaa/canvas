import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";

type WsData = { roomId: string };

const app = new Hono();
const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket<WsData>>();

const rooms = new Map<string, Set<ServerWebSocket<WsData>>>();

function broadcast(
  roomId: string,
  message: string,
  exclude?: ServerWebSocket<WsData>,
) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const client of room) {
    if (client !== exclude && client.readyState === 1) {
      client.send(message);
    }
  }
}

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const roomId = c.req.query("room") ?? "default";

    return {
      onOpen(_, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        raw.data = { roomId };

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId)!.add(raw);

        console.log(
          `[+] client joined room "${roomId}" (${rooms.get(roomId)!.size} total)`,
        );

        raw.send(JSON.stringify({ type: "connected", roomId }));
        broadcast(roomId, JSON.stringify({ type: "peer_joined", roomId }), raw);
      },

      onMessage(event, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        const { roomId } = raw.data;
        broadcast(roomId, event.data as string, raw);
      },

      onClose(_, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        const { roomId } = raw.data;
        rooms.get(roomId)?.delete(raw);

        if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);

        console.log(`[-] client left room "${roomId}"`);
        broadcast(roomId, JSON.stringify({ type: "peer_left", roomId }));
      },

      onError(error) {
        console.error("[ws error]", error);
      },
    };
  }),
);

const PORT = 3001;

Bun.serve({
  fetch: app.fetch,
  websocket,
  port: PORT,
});

console.log(`backend running on ws://localhost:${PORT}`);
