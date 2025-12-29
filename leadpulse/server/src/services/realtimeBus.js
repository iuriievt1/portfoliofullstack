import { EventEmitter } from "node:events";

// A tiny in-memory bus for SSE + other realtime triggers.
// In production, swap for Redis pub/sub or similar.
export const realtimeBus = new EventEmitter();
realtimeBus.setMaxListeners(1000);

export function emitOrgEvent(orgId, event, payload) {
  realtimeBus.emit(`org:${orgId}:${event}`, payload);
  realtimeBus.emit(`org:${orgId}:any`, { event, payload });
}
