# Maestro

Maestro is a premium, multi-vendor marketplace platform built for modern commerce teams that need a launch-ready foundation instead of a disposable prototype. It combines a conversion-focused public storefront, customer account area, seller workspace, and platform admin control center in one modular codebase.

The product is designed for curated lifestyle, home, wellness, beauty, and premium niche commerce brands that want strong trust signals, elegant UX, multi-seller expansion, and a scalable architecture from day one.

## What is included

- Public storefront with homepage, category pages, search, catalog grid, product detail pages, cart, checkout, wishlist, help, privacy, and terms
- Customer account area with order history and wishlist access
- Seller dashboard with onboarding, product creation, order view, inventory visibility, analytics, and promotion entry points
- Admin panel with seller approvals, product moderation, order visibility, coupon management, and overview analytics
- JWT cookie authentication with protected routes
- Prisma + PostgreSQL schema for marketplace-grade entities
- Redis-backed search result caching hooks
- Stripe checkout + webhook ready architecture
- Docker, Docker Compose, and CI workflow
- Seed data for local development and demos to buyers/investors

## Product concept

Maestro positions itself as a premium marketplace infrastructure product rather than a commodity storefront theme. The platform focuses on:

- High-trust branding and premium visual presentation
- Curated multi-vendor operations
- Strong mobile-first UX
- Seller onboarding and moderation controls
- Order, inventory, review, promotion, and payout-ready business logic
- SEO-ready catalog architecture and dynamic sitemap generation

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Node.js
- PostgreSQL
- Prisma ORM
- Redis
- Stripe
- Docker

## Architecture

### Layers

- `src/app`  
  App Router pages, route handlers, metadata routes, and protected areas
- `src/components`  
  Reusable UI, commerce, dashboard, and form components
- `src/lib`  
  Authentication, session management, caching, services, validation, database, utilities
- `prisma`  
  Schema and seed logic
- `.github/workflows`  
  CI pipeline

### Business domains

- Catalog and search
- Cart and checkout
- Accounts and authentication
- Seller operations
- Admin moderation
- Reviews and social proof
- Promotions, coupons, and payouts-ready structures
- Notifications

### Request flow

1. User lands on an SEO-optimized public route
2. Server components fetch catalog data from Prisma
3. Redis optionally caches search-heavy responses
4. Protected routes are checked in `src/proxy.ts` and validated again at page/API level
5. Checkout creates platform orders grouped by seller
6. Stripe webhook marks orders as paid
7. Admin and seller surfaces expose operational workflows

## Database schema overview

### Core identity

- `User`
- `SellerProfile`
- `Address`
- `Notification`

### Catalog

- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`
- `Review`

### Commerce

- `Cart`
- `CartItem`
- `WishlistItem`
- `Order`
- `OrderItem`

### Growth and monetization

- `Coupon`
- `Promotion`

### Seller finance and stock

- `SellerPayoutAccount`
- `Payout`
- `InventoryMovement`

The Prisma schema already includes enums for product states, seller states, payment states, payout states, coupon scopes, and more.

## Folder structure

```text
maestro-marketplace/
├── .github/
│   └── workflows/ci.yml
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── account/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── help/
│   │   ├── legal/
│   │   ├── products/
│   │   ├── search/
│   │   ├── seller/
│   │   ├── wishlist/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── dashboard/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── shared/
│   │   └── ui/
│   ├── lib/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── auth.ts
│   │   ├── cache.ts
│   │   ├── constants.ts
│   │   ├── db.ts
│   │   ├── redis.ts
│   │   ├── seo.ts
│   │   ├── session.ts
│   │   ├── stripe.ts
│   │   └── utils.ts
│   └── proxy.ts
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Local setup

1. Copy environment variables

```bash
cp .env.example .env
```

2. Install dependencies

```bash
npm install
```

3. Start infrastructure

```bash
docker compose up -d postgres redis
```

4. Generate Prisma client and push schema

```bash
npm run prisma:generate
npm run prisma:push
```

5. Seed sample data

```bash
npm run prisma:seed
```

6. Start development server

```bash
npm run dev
```

## Environment variables

See `.env.example` for the full template. Core values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/maestro
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
AUTH_SECRET=change-me
DEFAULT_CURRENCY=USD
DEFAULT_LOCALE=en-US

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
```

## Seed accounts

The seed script creates:

- Admin user
- Two sellers
- One customer
- Categories
- Multiple products with variants and reviews
- Active promotion
- Welcome coupon
- Example paid order

Open `prisma/seed.ts` to adjust seed identities, passwords, and product mix for your market.

## Deployment

### Docker deployment

```bash
docker compose up --build
```

### Typical production flow

1. Managed PostgreSQL
2. Managed Redis
3. App deployment on container platform or VPS
4. CI pipeline runs install, lint, Prisma generate, and production build
5. Run Prisma migrations in release workflow
6. Configure Stripe secrets and webhook endpoint
7. Point domain and CDN to app

### Recommended platforms

- Railway / Render / Fly / self-hosted VPS for fast MVP launch
- AWS / GCP / Azure / Kubernetes for larger scale
- Vercel-compatible deployment if your infra and database topology fit your needs

## Security notes

- Passwords are hashed with bcrypt
- Auth uses signed HTTP-only cookies
- Sensitive areas are protected in both route proxy and server-side checks
- Admin and seller permissions are role-gated
- Checkout, review, wishlist, and moderation endpoints validate input with Zod
- Stripe webhook uses signature verification
- Prisma avoids raw SQL in core flows
- Seller payouts are modeled separately to support Stripe Connect or custom payout providers later

Before production launch, add:

- CSRF strategy for all state-changing browser form flows
- Rate limiting for auth and public search endpoints
- Audit logs for admin actions
- S3-compatible object storage for uploads
- Email verification and password reset flows
- Session revocation / device management
- Fraud monitoring and address verification

## Performance strategy

- App Router server components for low client-side overhead
- Metadata routes for sitemap and robots
- Reusable product-card and dashboard primitives
- Redis-backed search result caching
- Selective caching for category, home, and product reads
- Standalone Next output for leaner deployments
- Mobile-first layout and simplified visual hierarchy
- Avoid heavy client bundles by keeping business logic on the server
- Optimized images and CDN-ready asset strategy

## SEO strategy

- Semantic page structure
- Catalog-friendly clean slugs
- Dynamic sitemap generation
- Strong metadata helpers in `src/lib/seo.ts`
- Fast server-rendered catalog pages
- Product/category page separation for crawlability

## Stripe and payouts

The project is payment-ready and payout-ready, not hardcoded to one provider forever.

Current implementation includes:

- Stripe checkout session creation
- Stripe webhook endpoint
- Seller payout account schema
- Payout model for transfer tracking
- Seller onboarding state flags

To go fully live with payouts:

- enable Stripe Connect onboarding
- store connected account ids in `SellerProfile`
- create transfer and payout orchestration jobs
- reconcile payouts in `Payout`
- add payout statements/export tools in seller dashboard

## Roadmap

### Phase 1
- Complete launch polish
- Add media upload pipeline
- Add forgot password / email verification
- Add saved addresses UI
- Add order detail pages

### Phase 2
- Stripe Connect onboarding
- Seller payout dashboard
- Multi-warehouse inventory
- Refunds and returns flows
- Email + in-app notifications
- Advanced coupon engine

### Phase 3
- Search indexing with Meilisearch/OpenSearch
- Personalized recommendations
- Event-driven architecture
- BI warehouse sync
- Internationalization and multi-currency
- B2B wholesale mode

## Notes

This repository is intentionally structured as a serious launch foundation. It already covers the real marketplace surfaces and data model, but every live marketplace still needs business-specific integrations before shipping to customers at scale:

- real email provider
- object storage
- fraud tooling
- tax logic for target jurisdictions
- shipping integrations
- observability stack
- support tooling
- legal copy review

That said, Maestro is set up to move directly into implementation and deployment rather than requiring a rebuild from scratch.
