# OTPBank — Digital Banking Platform

A portfolio-grade, bank-inspired digital banking platform built with a fintech-oriented architecture.

This project demonstrates a serious engineering foundation for a modern online banking product: customer web app, admin/support backoffice, ledger-driven money movement, RBAC, audit trails, idempotent transfers, and a compliance-aware architecture.

1) Highlights
- Customer banking web app
- Admin backoffice
- Support workspace
- NestJS API + Prisma + PostgreSQL + Redis
- Double-entry ledger foundation
- Transfer flow with idempotency protection
- Role-based access control: `USER`, `ADMIN`, `SUPPORT`
- Session/auth foundation with JWT + refresh flow baseline
- Audit logging and risk/compliance-oriented structure
- Responsive fintech-style UI with Next.js

2) Tech Stack
2.1) Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query

2.2) Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ worker scaffolding
- JWT auth

2.3) Tooling
- pnpm workspaces
- Docker Compose
- Swagger / OpenAPI

3) Main Areas

3.1) Customer App
- Login / authentication
- Dashboard
- Accounts
- Transactions
- Transfers
- Cards
- Documents
- Security/settings

3.2) Admin Backoffice
- Operations dashboard
- User/account review
- Risk / audit-oriented structure
- Role-protected endpoints

3.3) Support Backoffice
- Support workspace
- Restricted access by role
- Separate API surface
`

4) Demo Credentials
4.1) User
- user@otpbank.local
- OtpbankDemo123!

4.2) Admin
- admin@otpbank.local
- OtpbankDemo123!

4.3) Support
- support@otpbank.local
- OtpbankDemo123!
