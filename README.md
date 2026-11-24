# Full-Stack Portfolio — Iurii Evteev

Senior full-stack developer in Prague. TypeScript across the stack: React Native / Expo, React / Next.js, Node.js / NestJS, PostgreSQL.

Each folder is a standalone project with its own README and setup instructions.

## Projects in this repository

| Project | What it is | Stack |
| --- | --- | --- |
| [Loft N8](./loft-n8) | QR ordering for guests and an operations app for staff, built for a restaurant group with three venues: station tickets for kitchen and bar, split bills, shift reports, live updates and push notifications | Next.js 16, React 19, Tailwind 4, Express 5, Prisma, PostgreSQL, SSE, Web Push, Docker, Caddy |
| [OTPBank](./otpbank) | Digital banking platform: customer web app, admin and support backoffice, double-entry ledger, idempotent transfers, RBAC and audit trail | Next.js, NestJS, Prisma, PostgreSQL, Redis, BullMQ |
| [VYBE](./vybe_v1) | Geo-social platform for Prague: live posts with photos around real places, crowd and noise levels, post expiration | NestJS, Prisma, PostgreSQL, Next.js, Tailwind |
| [Client Portal](./ClientPortal) | Portal for folders, documents and files with a web and a mobile client on one API: roles, sharing, search, notifications | Next.js, Expo React Native, Prisma |
| [Arctic Home](./artcitcgrp) | Website of a home construction and design company | HTML, CSS, JavaScript |

## Commercial work (private code)

The code of these projects belongs to clients, so it is not in this repository. I am happy to walk through the architecture on a call.

- **Clinical Platform** — mobile app for hospital nurses: wound photos on a body map and scanned documents go straight into the hospital image archive. React Native / Expo, NestJS API and worker, PostgreSQL; DICOM delivery to PACS, FHIR clinical record, sign-in through Active Directory, offline queue, device approval.
- **Wildberries Marketplace** — multi-vendor marketplace for Czechia and the EU, in progress: seller portal with ARES / VIES company checks, product catalog with variants and EAN, admin with moderation, mobile app. NestJS, Prisma, PostgreSQL, Redis, S3, Next.js, Expo.
- **Streaming Platform** — live TV and video on demand for phones and tablets: Bitmovin player with DRM, TV guide, content rails. React Native / Expo, built in a product team.
