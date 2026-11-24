# Loft N8

Ordering and operations app for a restaurant and hookah lounge with three venues in Prague. I built it together with the owner.

## How it works

A guest scans the QR code on the table, opens the menu of that venue and sends an order. From the phone they can call the waiter or the hookah master, ask for the bill, pay only for their own items when the table splits the bill, rate the visit and collect loyalty points. Sign-in is a one-time code by email, or Google / Apple.

The staff have their own app. Each order is split into tickets for the kitchen, the bar and the hookah zone, and every station sees only its own tickets on a shared iPad. Waiters and managers see the tables, open orders and calls live, confirm payments, and at closing the manager gets a shift report to check against the card terminal and the cash drawer. There are seven staff roles, and the menu is managed in the app.

## Tech

- `client/` — Next.js 16, React 19, Tailwind CSS 4. Installable as an app, with separate manifests for guests and staff.
- `server/` — Express 5 and TypeScript, Prisma, PostgreSQL 16.
- Live updates go over Server-Sent Events, notifications over Web Push.
- Separate JWT secrets for guests, users and staff, bcrypt for staff passwords, Zod validation, rate limiting. Staff see guests' contacts masked.
- Production runs on Docker Compose behind Caddy. Migrations run when the server container starts.

## Run it locally

You need Node.js 20+ and Docker.

```bash
docker run -d --name loftn8-db -p 5432:5432 \
  -e POSTGRES_USER=loftn8 -e POSTGRES_PASSWORD=loftn8 -e POSTGRES_DB=loftn8 postgres:16

cd server
npm ci
cp .env.example .env
# in .env: DATABASE_URL=postgresql://loftn8:loftn8@localhost:5432/loftn8,
# FRONTEND_ORIGIN=http://localhost:3000 and three JWT secrets
npx prisma migrate deploy
npm run prisma:seed
npm run dev

cd ../client
npm ci
npm run dev
```

The server runs on http://localhost:4000, the app on http://localhost:3000. In development the client sends `/api/*` to the server.

## Run it with Docker Compose

```bash
cp .env.example .env
cp server/.env.docker.example server/.env.docker
docker compose up -d --build
docker compose exec server npm run prisma:seed   # first run only
```

Fill in the password, secrets, SMTP and VAPID keys in both files first. The app is then on port 80.
