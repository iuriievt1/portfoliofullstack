import type { LedgerEvent } from "@prisma/client";
import { sha256 } from "./hash.js";

export type Card = {
  id: string;
  title: string;
  status: "backlog" | "doing" | "review" | "done";
  tags: string[];
  updatedAt: string;
  archived?: boolean;
};

export type BoardState = {
  cards: Record<string, Card>;
};

export const DEFAULT_STATE: BoardState = { cards: {} };

export function computeEventHash(prevHash: string, event: { type: string; payload: unknown; actorId: string; createdAtISO: string }) {
  const payloadStr = JSON.stringify(event.payload ?? {});
  return sha256([prevHash, event.type, event.actorId, event.createdAtISO, payloadStr].join("|"));
}

export function applyEvent(state: BoardState, e: LedgerEvent): BoardState {
  const s: BoardState = { cards: { ...state.cards } };
  const p: any = e.payload ?? {};
  switch (e.type) {
    case "CARD_CREATED": {
      const id = p.id;
      if (!id) return s;
      s.cards[id] = {
        id,
        title: String(p.title ?? "Untitled"),
        status: (p.status ?? "backlog"),
        tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
        updatedAt: new Date(e.createdAt).toISOString()
      };
      return s;
    }
    case "CARD_UPDATED": {
      const id = p.id;
      if (!id || !s.cards[id]) return s;
      s.cards[id] = {
        ...s.cards[id],
        title: p.title != null ? String(p.title) : s.cards[id].title,
        tags: Array.isArray(p.tags) ? p.tags.map(String) : s.cards[id].tags,
        updatedAt: new Date(e.createdAt).toISOString()
      };
      return s;
    }
    case "CARD_MOVED": {
      const id = p.id;
      if (!id || !s.cards[id]) return s;
      const status = p.status;
      if (!status) return s;
      s.cards[id] = {
        ...s.cards[id],
        status,
        updatedAt: new Date(e.createdAt).toISOString()
      };
      return s;
    }
    case "CARD_ARCHIVED": {
      const id = p.id;
      if (!id || !s.cards[id]) return s;
      s.cards[id] = {
        ...s.cards[id],
        archived: true,
        updatedAt: new Date(e.createdAt).toISOString()
      };
      return s;
    }
    default:
      return s;
  }
}

export function reduceEvents(events: LedgerEvent[]) {
  return events.reduce((acc, e) => applyEvent(acc, e), DEFAULT_STATE);
}
