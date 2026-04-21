import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/i18n";
import { useCommerceStore } from "@/store";
import { colors, radius, shadows, spacing } from "@/theme";

export default function TabsLayout() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.md);
  const cartCount = useCommerceStore((state) =>
    state.cartItems.reduce((total, item) => total + item.quantity, 0)
  );

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: spacing.md,
          right: spacing.md,
          bottom: 0,
          height: 58 + bottomInset,
          paddingTop: spacing.xs,
          paddingBottom: bottomInset,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          ...shadows.floating
        },
        tabBarItemStyle: {
          paddingTop: 2
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 1
        },
        tabBarBadge:
          route.name === "cart" && cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : undefined,
        tabBarBadgeStyle: {
          backgroundColor: colors.primary,
          color: colors.card,
          fontSize: 10,
          fontWeight: "800"
        },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === "index"
              ? "home-outline"
              : route.name === "catalog"
                ? "grid-outline"
                : route.name === "cart"
                  ? "bag-outline"
                  : route.name === "orders"
                    ? "receipt-outline"
                    : "person-outline";

          return <Ionicons name={name} color={color} size={size} />;
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: t("common", "home") }} />
      <Tabs.Screen name="catalog" options={{ title: t("common", "catalog") }} />
      <Tabs.Screen name="cart" options={{ title: t("common", "cart") }} />
      <Tabs.Screen name="orders" options={{ title: t("common", "orders") }} />
      <Tabs.Screen name="profile" options={{ title: t("common", "profile") }} />
    </Tabs>
  );
}
