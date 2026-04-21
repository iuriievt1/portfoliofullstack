<<<<<<< HEAD
# Velora Market Mobile

Production-minded buyer marketplace app for Czechia built with React Native, Expo Router, TypeScript, Zustand, TanStack Query, React Hook Form and Zod. The codebase is designed for iOS + Android, starts with Czech UI copy, and keeps backend/payment/pickup/push integrations behind clean interfaces so mocks can be replaced without rewriting the app shell.

## Scope

- Buyer app only
- Czech-first UI with EN-ready i18n layer
- Praha-first launch assumptions
- V1 categories: fashion, accessories, beauty, home / decor, gifts / trendy goods, electronics, expensive electronics, food / supplements
- Explicitly excludes pharmacy / prescription / regulated pharma, seller app, admin panel

## Tech stack

- Expo + React Native + TypeScript
- Expo Router for app navigation
- Zustand for local commerce/auth state
- TanStack Query for server-state and data fetching
- React Hook Form + Zod for validation
- Axios-ready API client with mock mode
- SecureStore session handling
- Expo Notifications architecture hooks
- Sentry abstraction layer
- Jest + React Native Testing Library

## Project structure

```text
marketplace-mobile/
  app/
    (tabs)/
    auth/
    checkout/
    more/
    order/
    product/
  src/
    api/
    config/
    core/
    i18n/
    screens/
    services/
    shared/
    store/
    theme/
    types/
    utils/
  tests/
```

## Key screens

- Home
- Catalog
- Search
- Product details
- Favorites
- Cart
- Checkout
- Pickup point selection
- Orders list
- Order details
- Profile
- Addresses
- Notifications
- Support
- Returns
- Reviews
- Seller page
- Legal
- Settings
- Authentication

## Key entities

- User
- Address
- Seller
- Product
- ProductReview
- Category
- Banner
- Cart / CartItem
- PickupPoint
- PaymentMethod
- Order / OrderItem
- Notification

## Environment

Create `.env` from `.env.example` and update values:

```bash
cp .env.example .env
```

## Install and run

```bash
npm install
npm run start
```

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

### Web preview

```bash
npm run web
```

## Quality commands

```bash
npm run lint
npm run test
npm run typecheck
```

## EAS build / release prep

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
eas build --platform android --profile preview
eas build --platform all --profile production
```

Before production release:

- Replace mock mode with real API endpoints via `src/api/client.ts` and repository implementations in `src/api/mock.ts`
- Configure Sentry DSN through env
- Plug real push token registration into backend
- Connect PSP flows for card / Apple Pay / Google Pay
- Replace pickup point source with provider API and optional map adapter
- Add real legal copy, consent content, privacy endpoints, data export and account deletion flows

## Mock vs production integration status

### Mocked now

- Product catalog, home feed, seller data, reviews
- Auth session response
- Orders creation and notifications feed
- Address CRUD
- Pickup points
- Support / return / review submission responses

### Production-ready integration layer already prepared

- Centralized typed API layer with normalized errors
- Query keys and cache invalidation strategy
- Secure session storage
- Checkout orchestration
- Analytics abstraction
- Notifications permission flow
- Sentry bootstrap hook
- Env separation and EAS config

## Notes for real backend teams

- Replace `mockApi` with HTTP repositories while preserving the exported query hooks
- Keep DTO-to-domain mapping inside the API layer, not in screens
- Route auth expiration into a single re-auth/session restore path
- Validate all price, availability, seller and consent-sensitive decisions server-side before final order placement
=======
A collection of my full-stack projects (frontend + backend).  
Each project lives in its own folder with setup instructions inside.
>>>>>>> f207b19cd8ce271bce981ff8766affc3148a09b7
