import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, useEffect, useMemo, type PropsWithChildren } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { I18nProvider } from "@/i18n";
import { colors, typography } from "@/theme";
import { errorTracking } from "@/services/platform";
import { useAppStore, useAuthStore } from "@/store";
import { Button } from "@/shared/ui";
import { EntryGate } from "@/widgets/entry-gate";

class AppErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  override state = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    errorTracking.capture(error, {
      scope: "ui"
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            gap: 12,
            backgroundColor: colors.background
          }}
        >
          <Text style={[typography.h2, { textAlign: "center" }]}>Aplikace narazila na chybu</Text>
          <Text style={[typography.bodySmall, { textAlign: "center" }]}>
            Error boundary zachytil pád prezentační vrstvy.
          </Text>
          <Button title="Zkusit znovu" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}

export function AppProviders({ children }: PropsWithChildren) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const hydrated = useAuthStore((state) => state.hydrated);
  const restorePreferences = useAppStore((state) => state.restorePreferences);
  const preferencesHydrated = useAppStore((state) => state.hydrated);
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnReconnect: true
          }
        }
      }),
    []
  );

  useEffect(() => {
    errorTracking.init();
    void restoreSession();
    void restorePreferences();
  }, [restorePreferences, restoreSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <AppErrorBoundary>
              {hydrated && preferencesHydrated ? (
                selectedCountry ? (
                  children
                ) : (
                  <EntryGate />
                )
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.background
                  }}
                >
                  <ActivityIndicator color={colors.primary} size="large" />
                </View>
              )}
            </AppErrorBoundary>
          </QueryClientProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
