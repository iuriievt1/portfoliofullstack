# VYBE MVP

VYBE is a production-oriented MVP for a live geo-social social platform focused on Prague. This monorepo includes:

- `apps/api`: NestJS + Prisma + PostgreSQL + JWT + Swagger + image upload
- `apps/web`: Next.js + Tailwind responsive web client
- `apps/mobile`: prepared placeholder for future Flutter client
- `packages/shared-types`: shared response contracts
- `infra`: local PostgreSQL + Redis via Docker Compose
- `docs`: supporting product and contract notes

## Folder structure

```text
apps/
  api/
  web/
  mobile/
packages/
  shared-types/
docs/
infra/
```

## Local setup

1. Copy env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

2. Start infrastructure:

```bash
docker compose -f infra/docker-compose.yml up -d
```

3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client, run migrations, seed Prague demo data:

```bash
npm run db:generate
npm --workspace @vybe/api exec prisma migrate dev --name init
npm run db:seed
```

5. Start API and web:

```bash
npm run dev
```

API base URL: [http://localhost:4000/api](http://localhost:4000/api)  
Swagger: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)  
Web app: [http://localhost:3000](http://localhost:3000)

## Demo seed content

Seeded Prague places:

- Miners Coffee JZP
- Manifesto Market Andel
- Scott.Weber Workspace
- Anonymous Bar
- Duplex Prague

There is also a seeded demo user:

- email: `demo@vybe.city`
- username: `vybe_prague`
- password: `password123`

## Notes

- Image uploads are stored locally in `apps/api/uploads`.
- Redis is included for future notification, moderation, and trending work.
- Mobile implementation is intentionally deferred, but API contracts are documented in [docs/mobile-contracts.md](/Users/iuriievteev/Documents/New project/docs/mobile-contracts.md).

