# LeadPulse — Real‑time Lead & Pipeline OS (Full‑Stack)

A production‑grade portfolio project designed to show end‑to‑end ownership:
- **React (Vite) + Tailwind** frontend
- **Node.js + Express + MongoDB + JWT** backend
- **Real‑time updates** via Socket.IO + **live metrics** via SSE
- **RBAC / Organizations**, activity log, public lead capture endpoint
- Security hardening: Helmet, rate limiting, validation (Zod), cookie refresh token rotation
- API docs: Swagger UI
- Tests: Vitest + Supertest
- Docker: MongoDB via compose; Dockerfiles for server + web

## Quick start (local dev)

### 1) Prereqs
- Node.js 20+
- Docker (for MongoDB)

### 2) Setup env
Copy env examples:

```bash
cp .env.example .env
cp server/.env.example server/.env
cp web/.env.example web/.env
```

### 3) Start MongoDB
```bash
docker compose up -d
```

### 4) Install & run
```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

### 5) Seed demo data
In another terminal:
```bash
npm run seed
```

This prints a demo user + org + **publicKey** you can use to test the public lead capture endpoint.

## Public lead capture (example)

```bash
curl -X POST http://localhost:4000/api/public/lead \
  -H "Content-Type: application/json" \
  -d '{"publicKey":"<YOUR_PUBLIC_KEY>","name":"ACME s.r.o.","email":"team@acme.cz","message":"Need a quote"}'
```

## Tests
```bash
npm test
```

## Production notes
- Configure `SMTP_*` in `server/.env` to send real emails.
- In production set `COOKIE_SECURE=true` and serve API over HTTPS.
- Deploy web + server separately, or containerize both and put behind a reverse proxy.

---

**License:** MIT
