export const env = {
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "Velora Market",
  environment: process.env.EXPO_PUBLIC_ENV ?? "development",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.com",
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
  enableMocks: process.env.EXPO_PUBLIC_ENABLE_MOCKS !== "false"
} as const;

export const appConfig = {
  brandName: env.appName,
  defaultLocale: "cs",
  supportedLocales: ["cs", "en"] as const,
  defaultCountry: "cz",
  defaultCity: "praha",
  currency: "CZK",
  releaseChannel: "buyer-app",
  contactEmail: "support@velora.example",
  supportPhone: "+420 800 123 456"
} as const;
