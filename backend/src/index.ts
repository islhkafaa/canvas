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
    data TEXT NOT NULL,
    zIndex INTEGER DEFAULT 0
  );
`);

try {
  db.exec("ALTER TABLE shapes ADD COLUMN zIndex INTEGER DEFAULT 0");
} catch (e) {}

const getShapes = db.prepare<{ data: string }, [string]>(
  "SELECT data FROM shapes WHERE roomId = ? ORDER BY zIndex ASC",
);
const upsertShape = db.prepare<unknown, [string, string, string, string]>(
  "INSERT OR REPLACE INTO shapes (id, roomId, data, zIndex) VALUES (?, ?, ?, (SELECT IFNULL(MAX(zIndex), 0) + 1 FROM shapes WHERE roomId = ?))",
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

const getShapeZIndex = db.prepare<{ zIndex: number }, [string]>(
  "SELECT zIndex FROM shapes WHERE id = ?",
);
const updateShapeZIndex = db.prepare<unknown, [number, string]>(
  "UPDATE shapes SET zIndex = ? WHERE id = ?",
);
const getNextShape = db.prepare<
  { id: string; zIndex: number },
  [string, number]
>(
  "SELECT id, zIndex FROM shapes WHERE roomId = ? AND zIndex > ? ORDER BY zIndex ASC LIMIT 1",
);
const getPrevShape = db.prepare<
  { id: string; zIndex: number },
  [string, number]
>(
  "SELECT id, zIndex FROM shapes WHERE roomId = ? AND zIndex < ? ORDER BY zIndex DESC LIMIT 1",
);
const getMaxZIndex = db.prepare<{ maxZ: number }, [string]>(
  "SELECT MAX(zIndex) as maxZ FROM shapes WHERE roomId = ?",
);
const getMinZIndex = db.prepare<{ minZ: number }, [string]>(
  "SELECT MIN(zIndex) as minZ FROM shapes WHERE roomId = ?",
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
        const peersObj: Record<string, { x: number; y: number }> = {};

        for (const client of Array.from(rooms.get(roomId) || [])) {
          if (client.data.userId !== userId) {
            peersObj[client.data.userId] = { x: 0, y: 0 };
          }
        }

        raw.send(
          JSON.stringify({
            type: "init_room",
            shapes,
            peers: peersObj,
          } as ServerEvent),
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
                roomId,
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
            case "reorder_shape": {
              const { id, direction } = clientEvent;
              const currentZ = getShapeZIndex.get(id)?.zIndex;
              if (currentZ !== undefined) {
                let neighbor: { id: string; zIndex: number } | null = null;
                if (direction === "up") {
                  neighbor = getNextShape.get(roomId, currentZ) || null;
                } else if (direction === "down") {
                  neighbor = getPrevShape.get(roomId, currentZ) || null;
                } else if (direction === "top") {
                  const maxZ = getMaxZIndex.get(roomId)?.maxZ || 0;
                  updateShapeZIndex.run(maxZ + 1, id);
                } else if (direction === "bottom") {
                  const minZ = getMinZIndex.get(roomId)?.minZ || 0;
                  updateShapeZIndex.run(minZ - 1, id);
                }

                if (neighbor) {
                  updateShapeZIndex.run(neighbor.zIndex, id);
                  updateShapeZIndex.run(currentZ, neighbor.id);
                }
              }

              broadcast(
                roomId,
                {
                  type: "reorder_shape",
                  id: clientEvent.id,
                  direction: clientEvent.direction,
                } as any,
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
