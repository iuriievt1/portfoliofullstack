import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/core/providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="auth/index" options={{ presentation: "modal" }} />
        <Stack.Screen name="more/[screen]" />
      </Stack>
    </AppProviders>
  );
}
