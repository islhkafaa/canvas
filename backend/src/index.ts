import type { ServerWebSocket } from "bun";
import { Database } from "bun:sqlite";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import type { ClientEvent, ServerEvent, Shape } from "./types";

type WsData = { roomId: string; userId: string } & Record<string, any>;

const app = new Hono();
const { upgradeWebSocket, websocket } =
  createBunWebSocket<ServerWebSocket<WsData>>();

const db = new Database("canvas.db", { create: true });
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS shapes (
    id   TEXT PRIMARY KEY,
    roomId TEXT NOT NULL,
    data TEXT NOT NULL
  );
`);

const getShapes = db.prepare<{ data: string }, [string]>(
  "SELECT data FROM shapes WHERE roomId = ?",
);
const upsertShape = db.prepare<unknown, [string, string, string]>(
  "INSERT OR REPLACE INTO shapes (id, roomId, data) VALUES (?, ?, ?)",
);
const updateShapeData = db.prepare<unknown, [string, string]>(
  "UPDATE shapes SET data = ? WHERE id = ?",
);
const deleteShape = db.prepare<unknown, [string]>(
  "DELETE FROM shapes WHERE id = ?",
);
const deleteRoomShapes = db.prepare<unknown, [string]>(
  "DELETE FROM shapes WHERE roomId = ?",
);
const upsertRoom = db.prepare<unknown, [string]>(
  "INSERT OR IGNORE INTO rooms (id) VALUES (?)",
);
const deleteRoom = db.prepare<unknown, [string]>(
  "DELETE FROM rooms WHERE id = ?",
);

const rooms = new Map<string, Set<ServerWebSocket<WsData>>>();

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

function loadShapes(roomId: string): Shape[] {
  return getShapes.all(roomId).map((row) => JSON.parse(row.data) as Shape);
}

app.use("*", cors());

app.get("/rooms/:roomId/export", (c) => {
  const roomId = c.req.param("roomId");
  const shapes = loadShapes(roomId);
  return c.json(shapes);
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const roomId = c.req.query("room") ?? "default";
    const userId = crypto.randomUUID();

    return {
      onOpen(_, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        Object.assign(raw.data, { roomId, userId });

        upsertRoom.run(roomId);

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId)!.add(raw);

        console.log(`[+] client ${userId} joined room "${roomId}"`);

        raw.send(
          JSON.stringify({ type: "connected", roomId, userId } as ServerEvent),
        );

        const shapes = loadShapes(roomId);
        const peers = Array.from(rooms.get(roomId) || [])
          .filter((client) => client.data.userId !== userId)
          .map((client) => client.data.userId);

        raw.send(
          JSON.stringify({ type: "init_room", shapes, peers } as ServerEvent),
        );

        broadcast(roomId, { type: "peer_joined", userId }, raw);
      },

      onMessage(event, ws) {
        const raw = ws.raw as ServerWebSocket<WsData>;
        const { roomId, userId } = raw.data;

        try {
          const clientEvent = JSON.parse(event.data as string) as ClientEvent;

          switch (clientEvent.type) {
            case "add_shape":
              upsertShape.run(
                clientEvent.shape.id,
                roomId,
                JSON.stringify(clientEvent.shape),
              );
              broadcast(
                roomId,
                { type: "shape_added", shape: clientEvent.shape },
                raw,
              );
              break;
            case "update_shape": {
              const shapes = loadShapes(roomId);
              const existing = shapes.find((s) => s.id === clientEvent.id);
              if (existing) {
                const merged = { ...existing, ...clientEvent.data } as Shape;
                updateShapeData.run(JSON.stringify(merged), clientEvent.id);
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
            case "delete_shape":
              deleteShape.run(clientEvent.id);
              broadcast(
                roomId,
                { type: "shape_deleted", id: clientEvent.id },
                raw,
              );
              break;
            case "clear_room":
              deleteRoomShapes.run(roomId);
              broadcast(roomId, { type: "room_cleared" }, raw);
              break;
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
