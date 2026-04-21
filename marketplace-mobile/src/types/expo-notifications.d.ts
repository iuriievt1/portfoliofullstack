import "expo-notifications";

declare module "expo-notifications" {
  interface NotificationPermissionsStatus {
    granted: boolean;
    status: "granted" | "denied" | "undetermined";
  }
}

export {};
