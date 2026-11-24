# Loft N8 — Restaurant Ordering & Operations Platform

QR ordering for guests and an operations app for staff, built for a restaurant and hookah lounge group with three venues in Prague.

## What it does

**Guests** scan the QR code on the table and get the menu of that venue:

- order from the menu (with translations), add comments, follow the order live
- call the waiter or the hookah master, ask for the bill
- pay for their own items: the bill can be split per item between guests at one table
- rate the visit, collect loyalty points, get push notifications
- sign in with a one-time email code or with Google / Apple

**Staff** work in a separate app on phones and shared iPads:

- shifts and table overview, live dashboard of open orders and calls
- every order is split into tickets for the kitchen, the bar and the hookah zone; each station sees only its own tickets (`new → accepted → ready → served`)
- cancellations, payment confirmation, attaching guests to a table
- shift report at closing, reconciled with the POS terminal and the cash drawer
- menu administration, seven staff roles: waiter, hookah master, manager, admin, kitchen, bar, hookah zone

## Architecture

```text
                 ┌──────────────────────────┐
  guests ──────▶ │  client  (Next.js PWA)   │ ── /api/* ──┐
  staff  ──────▶ │  guest app + staff app   │             │
                 └──────────────────────────┘             ▼
                                               ┌─────────────────────┐      ┌────────────┐
                                               │ server (Express 5)  │ ───▶ │ PostgreSQL │
                                               │ REST + SSE + Push   │      │  (Prisma)  │
                                               └─────────────────────┘      └────────────┘
  production: Caddy ─▶ client:3000, /api ─▶ server:4000   (Docker Compose)
```

- **client/** — Next.js 16 (App Router), React 19, Tailwind CSS 4, installable PWA with separate manifests for guests and staff
- **server/** — Express 5 + TypeScript REST API, Prisma ORM, PostgreSQL 16
- **live updates** — Server-Sent Events for the guest order view and the staff dashboard
- **notifications** — Web Push (VAPID) for guests and staff
- **deploy** — Docker Compose with Caddy as the reverse proxy; migrations run on container start

## Security

- separate JWT secrets for users, guest sessions and staff
- one-time email codes, bcrypt for staff passwords, Google / Apple ID tokens verified on the server
- role checks on every staff route, request validation with Zod, rate limiting
- staff see guests' contacts masked (`iu•••@gmail.com`, `••• 517`)

## Run locally

Requirements: Node.js 20+, Docker.

```bash
# database
docker run -d --name loftn8-db -p 5432:5432 \
  -e POSTGRES_USER=loftn8 -e POSTGRES_PASSWORD=loftn8 -e POSTGRES_DB=loftn8 postgres:16

# server — http://localhost:4000
cd server
npm ci
cp .env.example .env        # set DATABASE_URL=postgresql://loftn8:loftn8@localhost:5432/loftn8
                            # FRONTEND_ORIGIN=http://localhost:3000 and the JWT secrets
npx prisma migrate deploy
npm run prisma:seed         # venues, tables, menu and staff accounts
npm run dev

# client — http://localhost:3000
cd ../client
npm ci
npm run dev
```

The client proxies `/api/*` to `http://localhost:4000` in development (`client/next.config.ts`).

## Run with Docker Compose

```bash
cp .env.example .env                              # POSTGRES_PASSWORD
cp server/.env.docker.example server/.env.docker  # secrets, SMTP, VAPID keys
docker compose up -d --build
docker compose exec server npm run prisma:seed    # first run only
```

The app is then served on port 80 through Caddy.
