import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";

import { env } from "@/config";
import type { Session } from "@/types/domain";

const SESSION_KEY = "velora.session";

export const errorTracking = {
  init() {
    if (!env.sentryDsn) {
      return;
    }

    Sentry.init({
      dsn: env.sentryDsn,
      tracesSampleRate: env.environment === "production" ? 0.2 : 1
    });
  },
  capture(error: unknown, context?: Record<string, string>) {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: context
      });
    }
  }
};

export const analytics = {
  track(event: string, payload?: Record<string, unknown>) {
    if (__DEV__) {
      console.log("[analytics]", event, payload ?? {});
    }
  }
};

export const sessionStorage = {
  async load() {
    const rawValue = await SecureStore.getItemAsync(SESSION_KEY);
    return rawValue ? (JSON.parse(rawValue) as Session) : null;
  },
  async save(session: Session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },
  async clear() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
};

export const notificationsService = {
  async requestPermissions() {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") {
      return existing;
    }

    return Notifications.requestPermissionsAsync();
  },
  async registerPushToken() {
    try {
      return await Notifications.getExpoPushTokenAsync();
    } catch {
      return null;
    }
  }
};

export const externalLinks = {
  async email(address: string) {
    await Linking.openURL(`mailto:${address}`);
  },
  async call(phone: string) {
    await Linking.openURL(`tel:${phone}`);
  }
};
