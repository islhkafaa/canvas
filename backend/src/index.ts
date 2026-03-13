import type { ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ClientEvent, ServerEvent, Shape } from "./types";

type WsData = { roomId: string; userId: string } & Record<string, any>;

const app = new Hono();
const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket<WsData>>();

const rooms = new Map<string, Set<ServerWebSocket<WsData>>>();
const roomShapes = new Map<string, Shape[]>();

function broadcast(
  roomId: string,
  event: ServerEvent,
  exclude?: ServerWebSocket<WsData>,
) {
  const room = rooms.get(roomId);
  if (!room) return;
  const message = JSON.stringify(event);
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
    const userId = crypto.randomUUID();

    return {
      onOpen(_, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        Object.assign(raw.data, { roomId, userId });

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
          roomShapes.set(roomId, []);
        }
        rooms.get(roomId)!.add(raw);

        console.log(`[+] client ${userId} joined room "${roomId}"`);

        raw.send(JSON.stringify({ type: "connected", roomId } as ServerEvent));

        const shapes = roomShapes.get(roomId) || [];
        raw.send(JSON.stringify({ type: "init_room", shapes } as ServerEvent));

        broadcast(roomId, { type: "peer_joined", userId }, raw);
      },

      onMessage(event, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        const { roomId, userId } = raw.data;

        try {
          const clientEvent = JSON.parse(event.data as string) as ClientEvent;
          const shapes = roomShapes.get(roomId) || [];

          switch (clientEvent.type) {
            case "add_shape":
              shapes.push(clientEvent.shape);
              broadcast(
                roomId,
                { type: "shape_added", shape: clientEvent.shape },
                raw,
              );
              break;
            case "update_shape": {
              const idx = shapes.findIndex((s) => s.id === clientEvent.id);
              if (idx !== -1) {
                shapes[idx] = { ...shapes[idx], ...clientEvent.data } as Shape;
                broadcast(
                  roomId,
                  {
                    type: "shape_updated",
                    id: clientEvent.id,
                    data: clientEvent.data,
                  },
                  raw,
                );
              }
              break;
            }
            case "delete_shape": {
              const newShapes = shapes.filter((s) => s.id !== clientEvent.id);
              roomShapes.set(roomId, newShapes);
              broadcast(
                roomId,
                { type: "shape_deleted", id: clientEvent.id },
                raw,
              );
              break;
            }
            case "cursor_move":
              broadcast(
                roomId,
                {
                  type: "cursor_moved",
                  userId,
                  x: clientEvent.x,
                  y: clientEvent.y,
                },
                raw,
              );
              break;
          }
        } catch (e) {
          console.error("Invalid message:", e);
        }
      },

      onClose(_, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        const { roomId, userId } = raw.data;
        rooms.get(roomId)?.delete(raw);

        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
          roomShapes.delete(roomId);
        }

        console.log(`[-] client ${userId} left room "${roomId}"`);
        broadcast(roomId, { type: "peer_left", userId });
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
