# ChronoLedger — Tamper‑Evident, Time‑Travel, Branching Event Ledger (Full‑Stack)

This project demonstrates **event‑sourcing**, **cryptographic integrity (hash‑chain)**, **time travel state reconstruction**, and **branching/forking timelines** — with a React dashboard and an Express API.

## Stack
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- JWT access + refresh token rotation (httpOnly cookie)
- Socket.IO realtime events
- Tailwind + React Query

## Run locally

### 1) Start Postgres
```bash
docker compose up -d
```

### 2) Env
```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
```

### 3) Install + DB + seed + dev
```bash
npm install
npm run db:push
npm run seed
npm run dev
```

Open:
- Web: http://localhost:5173
- API: http://localhost:4010
- Swagger: http://localhost:4010/api/docs

Demo creds are printed by `npm run seed`.

## Wow‑features (for portfolio demos)
- **Hash‑chain ledger:** every event has `prevHash` and `hash` → tamper‑evident audit trail.
- **Branching timelines:** fork a new branch from any event → “what‑if” scenarios.
- **Time travel:** reconstruct the board at any timestamp (or at branch base).
- **Realtime:** new events appear instantly across tabs (Socket.IO).
- **Public ingest:** send external events via `X-Api-Key` (think Stripe/GitHub webhooks).
