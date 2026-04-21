import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCatalogQuery, useHomeQuery, useOrdersQuery } from "@/api/client";
import { mockApi } from "@/api/mock";
import { cityOptions, discoveryTiles, type DiscoveryTile } from "@/constants/marketplace";
import { useI18n, type Locale } from "@/i18n";
import {
  BannerCard,
  BottomSheet,
  BrandPill,
  Button,
  Card,
  Chip,
  FixedBottomBar,
  ListRow,
  ProductCard,
  QuantityStepper,
  Screen,
  ScreenHeader,
  SearchField,
  Section,
  StateView
} from "@/shared/ui";
import { useAppStore, useAuthStore, useCommerceStore } from "@/store";
import { colors, radius, spacing, typography } from "@/theme";
import { calculateCartTotal, formatCurrency, formatFullDate, groupBy } from "@/utils";
import type { CatalogFilters, SupportedCity } from "@/types/domain";
import { analytics } from "@/services/platform";

const localize = (value: { cs: string; en: string }, locale: Locale) => value[locale];

function getCityName(city: SupportedCity, locale: Locale) {
  return cityOptions.find((item) => item.id === city)?.shortLabel[locale] ?? city;
}

function getCartQuantity(
  cartItems: { productId: string; quantity: number }[],
  productId: string
) {
  return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
}

function DiscoveryCard({
  tile,
  locale,
  onPress
}: {
  tile: DiscoveryTile;
  locale: Locale;
  onPress?: () => void;
}) {
  const subtitle = tile.subtitle ? localize(tile.subtitle, locale) : null;

  return (
    <Pressable
      disabled={tile.comingSoon && !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.discoveryCard,
        { backgroundColor: tile.accent, opacity: tile.comingSoon ? 0.82 : 1 },
        tile.featured && styles.discoveryCardFeatured,
        pressed && onPress ? { transform: [{ scale: 0.985 }] } : null
      ]}
    >
      <View style={styles.discoveryHeader}>
        <View style={styles.discoveryIconWrap}>
          <Ionicons name={tile.icon as never} size={18} color={tile.textColor} />
        </View>
        {tile.comingSoon ? (
          <View style={styles.discoverySoon}>
            <Text style={[styles.discoverySoonText, { color: tile.textColor }]}>
              {locale === "cs" ? "Brzy" : "Soon"}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.discoveryBody}>
        {subtitle ? (
          <Text numberOfLines={2} style={[styles.discoverySubtitle, { color: tile.textColor }]}>
            {subtitle}
          </Text>
        ) : (
          <View style={styles.discoverySubtitleSpacer} />
        )}
        <Text numberOfLines={2} style={[styles.discoveryTitle, { color: tile.textColor }]}>
          {localize(tile.title, locale)}
        </Text>
      </View>
    </Pressable>
  );
}

function AuthPrompt({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <StateView
      title={title}
      subtitle={subtitle}
      icon="person-circle-outline"
      action={<Button title="Sign in" onPress={() => router.push("/auth")} />}
    />
  );
}

export function HomeScreen() {
  const { t, locale, setLocale } = useI18n();
  const { data, isLoading, isError, refetch, isRefetching } = useHomeQuery();
  const selectedCity = useAppStore((state) => state.selectedCity);
  const selectCity = useAppStore((state) => state.selectCity);
  const session = useAuthStore((state) => state.session);
  const favoriteIds = useCommerceStore((state) => state.favoriteIds);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const toggleFavorite = useCommerceStore((state) => state.toggleFavorite);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  const bestsellers = data?.hotDeals.slice(0, 4) ?? [];
  const quickFilters = [
    locale === "cs" ? "Sleva" : "Deals",
    locale === "cs" ? "Top" : "Top",
    locale === "cs" ? "Expres" : "Express",
    locale === "cs" ? "Nové" : "New"
  ];

  const handleFavorite = (productId: string) => {
    if (!session) {
      router.push("/auth");
      return;
    }

    toggleFavorite(productId);
  };

  if (isLoading) {
    return (
      <Screen>
        <Card>
          <Text style={typography.h2}>{t("common", "loading")}</Text>
          <Text style={typography.bodySmall}>Preparing a cleaner marketplace feed…</Text>
        </Card>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <StateView
          title={t("common", "error")}
          subtitle="The home feed could not be loaded. Try again."
          action={<Button title={t("common", "retry")} onPress={() => refetch()} />}
        />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen contentStyle={{ paddingBottom: 120 }}>
        <View style={styles.homeTopBar}>
          <Pressable style={styles.cityPill} onPress={() => setCitySheetOpen(true)}>
            <Text style={styles.cityPillText}>{getCityName(selectedCity, locale)}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMain} />
          </Pressable>
          <BrandPill compact />
          <Pressable style={styles.utilityButton} onPress={() => setLocale(locale === "cs" ? "en" : "cs")}>
            <Text style={styles.utilityButtonText}>{locale.toUpperCase()}</Text>
          </Pressable>
        </View>

        <SearchField
          placeholder={t("common", "searchPlaceholder")}
          editable={false}
          onPressIn={() => router.push("/search")}
          trailing={<Ionicons name="options-outline" size={20} color={colors.primary} />}
        />

        <View style={styles.promoStrip}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.promoStripLabel}>{t("home", "promoLabel")}</Text>
            <Text style={styles.promoStripTitle}>
              {locale === "cs" ? "Doprava po městě od zítřka" : "City delivery starting tomorrow"}
            </Text>
          </View>
          <Button title={t("home", "heroCta")} variant="secondary" onPress={() => router.push("/catalog")} />
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroBubbleLeft} />
          <View style={styles.heroBubbleRight} />
          <Text style={styles.heroEyebrow}>{getCityName(selectedCity, locale)}</Text>
          <Text style={styles.heroTitle}>{t("home", "promoTitle")}</Text>
          <Text style={styles.heroSubtitle}>{t("home", "promoSubtitle")}</Text>
          <View style={styles.heroActions}>
            <Button title={t("home", "heroCta")} variant="accent" onPress={() => router.push("/catalog")} />
            <Button
              title={t("common", "favorites")}
              variant="secondary"
              onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "favorites" } })}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {quickFilters.map((chip, index) => (
            <Chip key={chip} label={chip} active={index === 0} />
          ))}
        </ScrollView>

        <Section title={t("home", "discover")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {data.banners.map((banner) => (
              <Pressable key={banner.id} style={{ width: 320 }} onPress={() => router.push("/catalog")}>
                <BannerCard
                  title={banner.title}
                  subtitle={banner.subtitle}
                  imageUrl={banner.imageUrl}
                  cta={banner.cta}
                />
              </Pressable>
            ))}
          </ScrollView>
        </Section>

        <Section
          title={t("home", "bestsellers")}
          action={<Button title={t("home", "openCatalog")} variant="ghost" onPress={() => router.push("/catalog")} />}
        >
          <View style={styles.productGrid}>
            {bestsellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.includes(product.id)}
                cartQuantity={getCartQuantity(cartItems, product.id)}
                onToggleFavorite={() => handleFavorite(product.id)}
                onPress={() => router.push(`/product/${product.id}`)}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </View>
        </Section>

        <Section title={t("home", "fastPickup")}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {data.pickupToday.map((product) => (
              <ProductCard
                key={product.id}
                compact
                product={product}
                isFavorite={favoriteIds.includes(product.id)}
                cartQuantity={getCartQuantity(cartItems, product.id)}
                onToggleFavorite={() => handleFavorite(product.id)}
                onPress={() => router.push(`/product/${product.id}`)}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </ScrollView>
        </Section>

        <Button
          title={isRefetching ? t("common", "loading") : t("common", "retry")}
          variant="ghost"
          onPress={() => refetch()}
        />
      </Screen>

      <BottomSheet visible={citySheetOpen} onClose={() => setCitySheetOpen(false)} title={t("home", "citySheetTitle")}>
        {cityOptions.map((city) => (
          <ListRow
            key={city.id}
            title={city.label[locale]}
            right={
              selectedCity === city.id ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              ) : (
                <Ionicons name="ellipse-outline" size={18} color={colors.textMuted} />
              )
            }
            onPress={() => {
              void selectCity(city.id);
              setCitySheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

export function CatalogScreen({ initialCategoryId }: { initialCategoryId?: string }) {
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<typeof mockApi.products>([]);
  const [filters, setFilters] = useState<CatalogFilters>({
    categoryId: initialCategoryId
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filtersKey = JSON.stringify(filters);
  const { data, isLoading, refetch, isFetching, isError } = useCatalogQuery(page, filters);
  const favoriteIds = useCommerceStore((state) => state.favoriteIds);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const session = useAuthStore((state) => state.session);
  const toggleFavorite = useCommerceStore((state) => state.toggleFavorite);
  const addToCart = useCommerceStore((state) => state.addToCart);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [filtersKey]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setItems((currentItems) => (page === 1 ? data.data : [...currentItems, ...data.data]));
  }, [data, page]);

  const activeChips = useMemo(
    () =>
      [
        filters.categoryId ? mockApi.categories.find((item) => item.id === filters.categoryId)?.name : null,
        filters.saleOnly ? (locale === "cs" ? "Sleva" : "Deals") : null,
        filters.pickupToday ? (locale === "cs" ? "Dnes" : "Today") : null,
        filters.deliveryTomorrow ? (locale === "cs" ? "Zítra" : "Tomorrow") : null
      ].filter(Boolean) as string[],
    [filters, locale]
  );

  const handleFavorite = (productId: string) => {
    if (!session) {
      router.push("/auth");
      return;
    }

    toggleFavorite(productId);
  };

  const handleTilePress = (tile: DiscoveryTile) => {
    if (tile.comingSoon) {
      return;
    }

    setFilters({
      categoryId: tile.categoryId,
      saleOnly: tile.saleOnly
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: 140
        }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.lg, marginBottom: spacing.lg }}>
            <ScreenHeader center={<BrandPill compact />} />
            <View style={{ gap: spacing.xs }}>
              <Text style={typography.h1}>{t("catalog", "title")}</Text>
              <Text style={typography.bodySmall}>{t("catalog", "subtitle")}</Text>
            </View>
            <SearchField
              placeholder={t("catalog", "searchInCatalog")}
              value={filters.query}
              onChangeText={(value) => setFilters((current) => ({ ...current, query: value }))}
              trailing={
                <Pressable onPress={() => setIsFilterOpen(true)}>
                  <Ionicons name="options-outline" size={20} color={colors.primary} />
                </Pressable>
              }
            />
            <View style={styles.discoveryGrid}>
              {discoveryTiles.map((tile) => (
                <DiscoveryCard key={tile.id} tile={tile} locale={locale} onPress={() => handleTilePress(tile)} />
              ))}
            </View>
            {activeChips.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {activeChips.map((chip) => (
                  <Chip key={chip} label={chip} active />
                ))}
                <Button title={t("catalog", "resetFilters")} variant="ghost" onPress={() => setFilters({})} />
              </ScrollView>
            ) : null}
            <Text style={typography.h2}>{t("catalog", "products")}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (data?.hasNextPage && !isFetching) {
            setPage((currentPage) => currentPage + 1);
          }
        }}
        ListEmptyComponent={
          isLoading ? (
            <Card>
              <Text style={typography.bodySmall}>{t("common", "loading")}</Text>
            </Card>
          ) : isError ? (
            <StateView
              title={t("common", "error")}
              subtitle="Check your connection and try loading the catalog again."
              action={<Button title={t("common", "retry")} onPress={() => refetch()} />}
            />
          ) : (
            <StateView
              title={t("catalog", "nothingFound")}
              subtitle={t("catalog", "nothingFoundSubtitle")}
              action={<Button title={t("catalog", "resetFilters")} onPress={() => setFilters({})} />}
            />
          )
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={favoriteIds.includes(item.id)}
            cartQuantity={getCartQuantity(cartItems, item.id)}
            onToggleFavorite={() => handleFavorite(item.id)}
            onPress={() => {
              analytics.track("product_viewed", { productId: item.id, source: "catalog" });
              router.push(`/product/${item.id}`);
            }}
            onAddToCart={() => addToCart(item)}
          />
        )}
        ListFooterComponent={
          data?.hasNextPage ? (
            <Button
              title={isFetching ? t("common", "loading") : t("common", "continue")}
              onPress={() => setPage((current) => current + 1)}
            />
          ) : (
            <Text style={[typography.bodySmall, { textAlign: "center", paddingTop: spacing.md }]}>
              {items.length} items
            </Text>
          )
        }
      />

      <BottomSheet visible={isFilterOpen} onClose={() => setIsFilterOpen(false)} title={t("catalog", "filters")}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Pressable onPress={() => setFilters((current) => ({ ...current, saleOnly: !current.saleOnly }))}>
            <Chip label={locale === "cs" ? "Sleva" : "Deals"} active={Boolean(filters.saleOnly)} />
          </Pressable>
          <Pressable onPress={() => setFilters((current) => ({ ...current, pickupToday: !current.pickupToday }))}>
            <Chip label={locale === "cs" ? "Vyzvednutí dnes" : "Pickup today"} active={Boolean(filters.pickupToday)} />
          </Pressable>
          <Pressable
            onPress={() => setFilters((current) => ({ ...current, deliveryTomorrow: !current.deliveryTomorrow }))}
          >
            <Chip label={locale === "cs" ? "Doručení zítra" : "Delivery tomorrow"} active={Boolean(filters.deliveryTomorrow)} />
          </Pressable>
        </View>
        <Button title={t("common", "continue")} onPress={() => setIsFilterOpen(false)} />
      </BottomSheet>
    </View>
  );
}

export function CartScreen() {
  const { t, locale } = useI18n();
  const selectedCity = useAppStore((state) => state.selectedCity);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const updateQuantity = useCommerceStore((state) => state.updateQuantity);
  const removeFromCart = useCommerceStore((state) => state.removeFromCart);
  const session = useAuthStore((state) => state.session);
  const subtotal = calculateCartTotal(cartItems, mockApi.products);
  const products = mockApi.products.filter((product) => cartItems.some((item) => item.productId === product.id));
  const grouped = groupBy(cartItems, (item) => item.sellerId);

  if (!cartItems.length) {
    return (
      <Screen centered>
        <StateView
          title={t("cartScreen", "emptyTitle")}
          subtitle={t("cartScreen", "emptySubtitle")}
          icon="bag-outline"
          action={<Button title={t("common", "continueShopping")} onPress={() => router.push("/catalog")} />}
        />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen contentStyle={{ paddingBottom: 170 }}>
        <View style={styles.cartHeader}>
          <BrandPill compact />
          <Text style={typography.h1}>{t("cartScreen", "title")}</Text>
          <Text style={typography.bodySmall}>{t("cartScreen", "selectAddress")}</Text>
        </View>

        {Object.entries(grouped).map(([sellerId, sellerCartItems]) => {
          const seller = mockApi.sellers.find((candidate) => candidate.id === sellerId);

          return (
            <Section key={sellerId} title={seller?.name ?? "Seller"}>
              <View style={{ gap: spacing.md }}>
                {sellerCartItems.map((item) => {
                  const product = products.find((candidate) => candidate.id === item.productId);

                  if (!product) {
                    return null;
                  }

                  return (
                    <Card key={item.id}>
                      <View style={styles.cartItemRow}>
                        <Image source={{ uri: product.images[0] }} style={styles.cartItemImage} contentFit="cover" />
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text style={styles.cartPrice}>{formatCurrency(product.price)}</Text>
                          <Text style={styles.cartTitle}>{product.name}</Text>
                          <Text style={typography.bodySmall}>
                            {product.pickupToday ? t("cartScreen", "pickupToday") : t("cartScreen", "deliverySoon")} ·{" "}
                            {getCityName(selectedCity, locale)}
                          </Text>
                          <Text style={[typography.bodySmall, { color: colors.success }]}>
                            {locale === "cs" ? "Vrácení při převzetí zdarma" : "Free refusal on delivery"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cartActions}>
                        <QuantityStepper value={item.quantity} onChange={(value) => updateQuantity(product.id, value)} />
                        <Button title={t("common", "buyNow")} variant="secondary" onPress={() => router.push("/checkout")} />
                      </View>
                      <View style={styles.cartMetaActions}>
                        <Button title={t("cartScreen", "saveForLater")} variant="ghost" />
                        <Button title={t("cartScreen", "remove")} variant="ghost" onPress={() => removeFromCart(product.id)} />
                      </View>
                    </Card>
                  );
                })}
              </View>
            </Section>
          );
        })}
      </Screen>

      <FixedBottomBar>
        <View style={{ gap: spacing.sm }}>
          <Text style={typography.bodySmall}>{t("cartScreen", "orderNote")}</Text>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutSummary}>
              {cartItems.length} pcs · {formatCurrency(subtotal)}
            </Text>
            <View style={{ flex: 1 }}>
              <Button
                title={t("cartScreen", "checkoutCta")}
                variant="accent"
                onPress={() =>
                  router.push(
                    session
                      ? "/checkout"
                      : {
                          pathname: "/auth",
                          params: {
                            redirectTo: "/checkout"
                          }
                        }
                  )
                }
              />
            </View>
          </View>
        </View>
      </FixedBottomBar>
    </View>
  );
}

export function OrdersScreen() {
  const session = useAuthStore((state) => state.session);
  const { data, isLoading, refetch } = useOrdersQuery();

  if (!session) {
    return (
      <Screen centered>
        <AuthPrompt
          title="Orders require an account"
          subtitle="After sign-in you will see shipment tracking, pickup codes, and order history."
        />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <Card>
          <Text style={typography.bodySmall}>Loading orders…</Text>
        </Card>
      </Screen>
    );
  }

  if (!data?.length) {
    return (
      <Screen centered>
        <StateView
          title="No orders yet"
          subtitle="Once you finish your first purchase, the order timeline will appear here."
          action={<Button title="Start shopping" onPress={() => router.push("/catalog")} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.ordersTopBar}>
        <BrandPill compact />
      </View>
      {data.map((order) => (
        <Card key={order.id}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={typography.h3}>{order.number}</Text>
              <Text style={typography.bodySmall}>{formatFullDate(order.createdAt)}</Text>
            </View>
            <Chip label={order.status.replaceAll("_", " ")} active />
          </View>
          <Text style={typography.bodySmall}>
            {order.items.length} items · {formatCurrency(order.total)}
          </Text>
          <Button title="Order details" onPress={() => router.push(`/order/${order.id}`)} />
        </Card>
      ))}
      <Button title="Refresh" variant="ghost" onPress={() => refetch()} />
    </Screen>
  );
}

export function ProfileScreen() {
  const { t, locale, setLocale } = useI18n();
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const selectedCity = useAppStore((state) => state.selectedCity);

  if (!session) {
    return (
      <Screen centered>
        <View style={styles.profileTopBar}>
          <BrandPill compact />
        </View>
        <StateView
          title={t("profileScreen", "signInTitle")}
          subtitle={t("profileScreen", "signInSubtitle")}
          icon="person-circle-outline"
          action={<Button title={t("common", "login")} onPress={() => router.push("/auth")} />}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.profileTopBar}>
        <BrandPill compact />
      </View>

      <Card>
        <Text style={typography.h2}>
          {session.user.firstName} {session.user.lastName}
        </Text>
        <Text style={typography.bodySmall}>{session.user.email}</Text>
        <Text style={typography.bodySmall}>{session.user.phone}</Text>
      </Card>

      <Section title={t("profileScreen", "account")}>
        <Card>
          <ListRow
            title={t("common", "favorites")}
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "favorites" } })}
          />
          <ListRow
            title={t("common", "addresses")}
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "addresses" } })}
          />
          <ListRow
            title={t("common", "notifications")}
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "notifications" } })}
          />
        </Card>
      </Section>

      <Section title={t("profileScreen", "services")}>
        <Card>
          <ListRow title={t("profileScreen", "language")} subtitle={locale.toUpperCase()} onPress={() => setLocale(locale === "cs" ? "en" : "cs")} />
          <ListRow title={t("profileScreen", "country")} subtitle={selectedCountry?.toUpperCase() ?? "CZ"} />
          <ListRow title={t("profileScreen", "city")} subtitle={getCityName(selectedCity, locale)} />
          <ListRow
            title={t("common", "legal")}
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "legal" } })}
          />
          <ListRow
            title={t("common", "support")}
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "support" } })}
          />
        </Card>
      </Section>

      <Button title={t("common", "logout")} variant="ghost" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  homeTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs
  },
  cityPill: {
    minHeight: 36,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  cityPillText: {
    ...typography.body,
    fontWeight: "700"
  },
  utilityButton: {
    minWidth: 52,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  utilityButtonText: {
    ...typography.label,
    color: colors.primary
  },
  promoStrip: {
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  promoStripLabel: {
    ...typography.label,
    color: "rgba(255,255,255,0.8)"
  },
  promoStripTitle: {
    ...typography.h3,
    color: colors.card
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    backgroundColor: colors.hero,
    overflow: "hidden",
    gap: spacing.md,
    ...StyleSheet.flatten({
      shadowColor: "#2E1065",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 8
    })
  },
  heroBubbleLeft: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -50,
    top: -10,
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  heroBubbleRight: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    bottom: -40,
    backgroundColor: "rgba(219,57,214,0.36)"
  },
  heroEyebrow: {
    ...typography.label,
    color: "rgba(255,255,255,0.82)"
  },
  heroTitle: {
    ...typography.hero,
    color: colors.card,
    maxWidth: "85%"
  },
  heroSubtitle: {
    ...typography.body,
    color: "rgba(255,255,255,0.9)",
    maxWidth: "82%"
  },
  heroActions: {
    flexDirection: "row",
    gap: spacing.md
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.lg
  },
  catalogTopBar: {
    alignItems: "center"
  },
  discoveryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md
  },
  discoveryCard: {
    width: "31.5%",
    minHeight: 120,
    borderRadius: radius.md,
    padding: spacing.md,
    justifyContent: "space-between",
    overflow: "hidden"
  },
  discoveryCardFeatured: {
    minHeight: 136
  },
  discoveryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  discoveryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  discoveryBody: {
    marginTop: "auto",
    minHeight: 56,
    justifyContent: "flex-end",
    gap: 6
  },
  discoveryTitle: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "800"
  },
  discoverySubtitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    opacity: 0.92
  },
  discoverySubtitleSpacer: {
    minHeight: 28
  },
  discoverySoon: {
    backgroundColor: "rgba(255,255,255,0.24)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  discoverySoonText: {
    ...typography.label
  },
  cartHeader: {
    gap: spacing.sm
  },
  cartItemRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  cartItemImage: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    backgroundColor: colors.muted
  },
  cartPrice: {
    ...typography.h2,
    color: colors.primary
  },
  cartTitle: {
    ...typography.body,
    fontWeight: "700"
  },
  cartActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  cartMetaActions: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  checkoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  checkoutSummary: {
    ...typography.h3,
    minWidth: 110
  },
  ordersTopBar: {
    alignItems: "center"
  },
  profileTopBar: {
    alignItems: "center"
  }
});
