import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Share, Text, View } from "react-native";

import {
  useCatalogQuery,
  useAddressMutation,
  useAddressesQuery,
  useDeleteAddressMutation,
  useLoginMutation,
  useNotificationsQuery,
  useOrderQuery,
  usePaymentMethodsQuery,
  usePickupPointsQuery,
  usePlaceOrderMutation,
  useProductQuery,
  useProductReviewsQuery,
  useSellerProductsQuery,
  useSellerQuery
} from "@/api/client";
import { mockApi } from "@/api/mock";
import { cityOptions } from "@/constants/marketplace";
import { appConfig } from "@/config";
import { useI18n } from "@/i18n";
import { useAppStore, useAuthStore, useCommerceStore } from "@/store";
import {
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
  StateView,
  StatusBadge,
  TextField,
  Timeline
} from "@/shared/ui";
import { colors, radius, spacing, typography } from "@/theme";
import {
  addressSchema,
  authSchema,
  checkoutContactSchema,
  formatCurrency,
  formatFullDate,
  returnSchema,
  reviewSchema,
  supportSchema
} from "@/utils";
import { analytics, externalLinks } from "@/services/platform";
import type { Address, DeliveryMethod } from "@/types/domain";

function getCartQuantity(
  cartItems: { productId: string; quantity: number }[],
  productId: string
) {
  return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
}

export function SearchScreen() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const rememberSearch = useCommerceStore((state) => state.rememberSearch);
  const recentSearches = useCommerceStore((state) => state.recentSearches);
  const { data: catalog } = useCatalogQuery(1, {
    query
  });

  const suggestions = useMemo(
    () =>
      mockApi.products
        .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5),
    [query]
  );

  return (
    <Screen>
      <ScreenHeader center={<BrandPill compact />} />
      <SearchField
        autoFocus
        placeholder={t("common", "searchPlaceholder")}
        value={query}
        onChangeText={(value) => {
          setQuery(value);
          if (value.trim()) {
            analytics.track("search_used", { query: value });
          }
        }}
        onSubmitEditing={() => rememberSearch(query)}
      />

      {recentSearches.length ? (
        <Section title={locale === "cs" ? "Nedávná hledání" : "Recent searches"}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {recentSearches.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={locale === "cs" ? "Trendující dotazy" : "Trending searches"}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {["wireless", "gift box", "Praha decor", "beauty serum", "top electronics"].map((item) => (
            <Chip key={item} label={item} active={item === "gift box"} />
          ))}
        </View>
      </Section>

      <Section title={locale === "cs" ? "Návrhy" : "Suggestions"}>
        <View style={{ gap: spacing.md }}>
          {suggestions.map((product) => (
            <ListRow
              key={product.id}
              title={product.name}
              subtitle={`${product.brand} • ${formatCurrency(product.price)}`}
              onPress={() => {
                rememberSearch(product.name);
                router.push(`/product/${product.id}`);
              }}
            />
          ))}
        </View>
      </Section>

      <Section
        title={locale === "cs" ? "Kategorie a značky" : "Categories and brands"}
        subtitle={
          locale === "cs"
            ? "Rychlé napovězení před otevřením katalogu."
            : "Quick hints before opening the catalog."
        }
      >
        <Card>
          <Text style={typography.bodySmall}>Fashion, beauty, electronics, home / decor, gifts</Text>
          <Text style={typography.bodySmall}>Luna, Nordic Nest, Arc, Glow+, Daily Fuel</Text>
          <Text style={typography.bodySmall}>
            {locale === "cs" ? "Výsledky" : "Results"}: {catalog?.total ?? 0}
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}

export function ProductDetailsScreen({ productId }: { productId: string }) {
  const { t, locale } = useI18n();
  const selectedCity = useAppStore((state) => state.selectedCity);
  const session = useAuthStore((state) => state.session);
  const favoriteIds = useCommerceStore((state) => state.favoriteIds);
  const toggleFavorite = useCommerceStore((state) => state.toggleFavorite);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const updateQuantity = useCommerceStore((state) => state.updateQuantity);
  const { data: product, isLoading, refetch } = useProductQuery(productId);
  const { data: reviews } = useProductReviewsQuery(productId);
  const sellerId = product?.sellerId ?? "";
  const { data: seller } = useSellerQuery(sellerId);
  const similarProducts = mockApi.products
    .filter((item) => item.categoryId === product?.categoryId && item.id !== product?.id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <Screen>
        <Card>
          <Text style={typography.bodySmall}>{t("common", "loading")}</Text>
        </Card>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <StateView
          title={locale === "cs" ? "Produkt není dostupný" : "Product unavailable"}
          subtitle={
            locale === "cs"
              ? "Produkt mohl být stažen nebo je dočasně nedostupný."
              : "This product may have been removed or is temporarily unavailable."
          }
          action={<Button title={t("common", "continueShopping")} onPress={() => router.replace("/catalog")} />}
        />
      </Screen>
    );
  }

  const cityName = cityOptions.find((item) => item.id === selectedCity)?.label[locale] ?? selectedCity;
  const currentCartItem = cartItems.find((item) => item.productId === product.id);

  const handleFavorite = () => {
    if (!session) {
      router.push("/auth");
      return;
    }
    toggleFavorite(product.id);
  };

  const openCheckout = () => {
    router.push(
      session
        ? "/checkout"
        : {
            pathname: "/auth",
            params: {
              redirectTo: "/checkout"
            }
          }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen contentStyle={{ paddingBottom: 188 }}>
        <ScreenHeader center={<BrandPill compact />} />

        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {product.images.map((image) => (
            <View key={image} style={{ width: 360 }}>
              <Card style={{ padding: 0, overflow: "hidden", borderWidth: 0 }}>
                <View style={{ aspectRatio: 0.98 }}>
                  <Image
                    source={{ uri: image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: spacing.md,
                      right: spacing.md,
                      flexDirection: "row",
                      gap: spacing.sm
                    }}
                  >
                    <Button
                      title=""
                      variant="ghost"
                      icon={favoriteIds.includes(product.id) ? "heart" : "heart-outline"}
                      onPress={handleFavorite}
                    />
                    <Button title="" variant="ghost" icon="share-social-outline" onPress={() => void Share.share({ message: `${appConfig.brandName}: ${product.name}` })} />
                  </View>
                  <View
                    style={{
                      position: "absolute",
                      right: spacing.md,
                      bottom: spacing.md,
                      backgroundColor: "rgba(255,255,255,0.92)",
                      borderRadius: radius.pill,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm
                    }}
                  >
                    <Text style={[typography.label, { color: colors.textMain }]}>
                      {locale === "cs" ? "Podobné produkty" : "Similar items"}
                    </Text>
                  </View>
                </View>
              </Card>
            </View>
          ))}
        </ScrollView>

        <Card>
          <View style={{ gap: spacing.sm }}>
            <Text style={typography.h2}>{product.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" }}>
              <Text style={[typography.h1, { color: colors.primary }]}>{formatCurrency(product.price)}</Text>
              {product.oldPrice ? (
                <Text style={[typography.body, { textDecorationLine: "line-through", color: colors.textSecondary }]}>
                  {formatCurrency(product.oldPrice)}
                </Text>
              ) : null}
              {product.oldPrice ? (
                <Text style={[typography.bodySmall, { color: colors.success, fontWeight: "700" }]}>
                  {locale === "cs" ? "ušetříte" : "save"} {formatCurrency(product.oldPrice - product.price)}
                </Text>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {product.badges.map((badge) => (
                <Chip key={badge} label={badge} active={badge === "Sleva" || badge === "Top"} />
              ))}
            </View>
            <Text style={typography.bodySmall}>
              {product.pickupToday
                ? locale === "cs"
                  ? `Vyzvednutí ještě dnes ve městě ${cityName}`
                  : `Pickup today in ${cityName}`
                : locale === "cs"
                  ? `Doručení zítra do města ${cityName}`
                  : `Delivery tomorrow in ${cityName}`}
            </Text>
            <Text style={typography.body}>{product.description}</Text>
          </View>
        </Card>

        <Section title={locale === "cs" ? "Prodejce" : "Seller"}>
          <Card>
            <Text style={typography.body}>{seller?.name}</Text>
            <Text style={typography.bodySmall}>{seller?.deliverySpeed}</Text>
            <Text style={typography.bodySmall}>{seller?.returnPolicy}</Text>
            <Button
              title={locale === "cs" ? "Stránka prodejce" : "Seller page"}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/more/[screen]",
                  params: { screen: "seller", sellerId: product.sellerId }
                })
              }
            />
          </Card>
        </Section>

        <Section title={locale === "cs" ? "Doručení a převzetí" : "Delivery and pickup"}>
          <Card>
            <ListRow
              title={locale === "cs" ? "Výdejní místo" : "Pickup point"}
              subtitle={
                locale === "cs" ? "Vyberte výdejní místo nebo box" : "Choose a pickup point or locker"
              }
              onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "pickup" } })}
            />
            <ListRow
              title={locale === "cs" ? "Vrácení" : "Returns"}
              subtitle={
                locale === "cs" ? "Vrácení do 14-30 dnů podle prodejce" : "14-30 day returns depending on seller"
              }
              onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "returns" } })}
            />
          </Card>
        </Section>

        <Section title={locale === "cs" ? "Specifikace" : "Specifications"}>
          <Card>
            {Object.entries(product.specs).map(([label, value]) => (
              <ListRow key={label} title={label} subtitle={value} icon="remove-outline" />
            ))}
          </Card>
        </Section>

        <Section title={locale === "cs" ? "Recenze" : "Reviews"}>
          <Card>
            <Text style={typography.bodySmall}>
              {product.rating} / 5 · {product.reviewCount} {locale === "cs" ? "hodnocení" : "ratings"}
            </Text>
            {reviews?.map((review) => (
              <View key={review.id} style={{ gap: 4 }}>
                <Text style={typography.body}>{review.author}</Text>
                <Text style={typography.bodySmall}>
                  {review.rating}★ • {formatFullDate(review.createdAt)}
                </Text>
                <Text style={typography.bodySmall}>{review.text}</Text>
              </View>
            ))}
            <Button
              title={locale === "cs" ? "Více recenzí" : "More reviews"}
              variant="ghost"
              onPress={() =>
                router.push({ pathname: "/more/[screen]", params: { screen: "reviews", productId } })
              }
            />
          </Card>
        </Section>

        <Section title={locale === "cs" ? "Podobné produkty" : "Similar products"}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md }}
          >
            {similarProducts.map((similarProduct) => (
              <ProductCard
                key={similarProduct.id}
                product={similarProduct}
                compact
                isFavorite={favoriteIds.includes(similarProduct.id)}
                cartQuantity={getCartQuantity(cartItems, similarProduct.id)}
                onToggleFavorite={() => {
                  if (!session) {
                    router.push("/auth");
                    return;
                  }
                  toggleFavorite(similarProduct.id);
                }}
                onAddToCart={() => addToCart(similarProduct)}
                onPress={() => router.push(`/product/${similarProduct.id}`)}
              />
            ))}
          </ScrollView>
        </Section>

        <Section title={locale === "cs" ? "Důležité informace" : "Need to know"}>
          <Card>
            <ListRow
              title={locale === "cs" ? "Jak vrátit zboží?" : "How do returns work?"}
              subtitle={
                locale === "cs"
                  ? "Vrácení řešíte v objednávce nebo přes podporu."
                  : "You can start a return from the order screen or support."
              }
              icon="help-circle-outline"
            />
            <ListRow
              title={locale === "cs" ? "Cookies / souhlasy" : "Cookies / consent"}
              subtitle={
                locale === "cs" ? "Napojené přes legal/settings layer." : "Connected through the legal and settings layer."
              }
              icon="shield-checkmark-outline"
            />
            <Button
              title={locale === "cs" ? "Nahlásit produkt" : "Report product"}
              variant="ghost"
              onPress={() =>
                router.push({
                  pathname: "/more/[screen]",
                  params: { screen: "support", productId: product.id }
                })
              }
            />
            <Button title={locale === "cs" ? "Obnovit detail" : "Refresh details"} variant="ghost" onPress={() => refetch()} />
          </Card>
        </Section>
      </Screen>

      <FixedBottomBar>
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={typography.h3}>{formatCurrency(product.price)}</Text>
            <Button
              title={favoriteIds.includes(product.id) ? t("common", "favorites") : t("common", "favorites")}
              variant="ghost"
              onPress={handleFavorite}
            />
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button title={t("common", "buyNow")} variant="accent" onPress={openCheckout} />
            </View>
            <View style={{ flex: 1 }}>
              {currentCartItem ? (
                <QuantityStepper value={currentCartItem.quantity} onChange={(value) => updateQuantity(product.id, value)} />
              ) : (
                <Button
                  title={t("common", "addToCart")}
                  onPress={() => {
                    addToCart(product);
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </FixedBottomBar>
    </View>
  );
}

export function OrderDetailsScreen({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrderQuery(orderId);

  if (isLoading) {
    return (
      <Screen>
        <Card>
          <Text style={typography.bodySmall}>Načítáme detail objednávky…</Text>
        </Card>
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <StateView title="Objednávka nenalezena" subtitle="Zkontrolujte historii objednávek." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <View style={{ gap: 4 }}>
            <Text style={typography.h2}>{order.number}</Text>
            <Text style={typography.bodySmall}>{formatFullDate(order.createdAt)}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>
      </Card>

      <Section title="Tracking timeline">
        <Card>
          <Timeline
            items={[
              { label: "Objednávka přijata", date: order.createdAt, active: true },
              { label: "Platba potvrzena", date: order.createdAt, active: order.status !== "pending" },
              {
                label: "Předáno dopravci",
                date: order.createdAt,
                active: ["processing", "shipped", "ready_for_pickup", "delivered"].includes(order.status)
              },
              {
                label: "Připraveno k vyzvednutí",
                date: order.createdAt,
                active: ["ready_for_pickup", "delivered"].includes(order.status)
              },
              { label: "Doručeno", date: order.createdAt, active: order.status === "delivered" }
            ]}
          />
          {order.pickupCode ? (
            <Card style={{ backgroundColor: colors.chipBg }}>
              <Text style={typography.h3}>Pickup code / QR placeholder</Text>
              <Text style={typography.bodySmall}>{order.pickupCode}</Text>
            </Card>
          ) : null}
        </Card>
      </Section>

      <Section title="Položky">
        <View style={{ gap: spacing.md }}>
          {order.items.map((item) => {
            const product = mockApi.products.find((candidate) => candidate.id === item.productId);
            return (
              <Card key={item.id}>
                <Text style={typography.body}>{product?.name ?? item.productId}</Text>
                <Text style={typography.bodySmall}>
                  {item.quantity} × {formatCurrency(item.price)}
                </Text>
              </Card>
            );
          })}
        </View>
      </Section>

      <Section title="Souhrn">
        <Card>
          <ListRow
            title="Subtotal"
            right={<Text style={typography.body}>{formatCurrency(order.subtotal)}</Text>}
          />
          <ListRow
            title="Delivery"
            right={<Text style={typography.body}>{formatCurrency(order.deliveryFee)}</Text>}
          />
          <ListRow
            title="Discount"
            right={<Text style={typography.body}>{formatCurrency(order.discount)}</Text>}
          />
          <ListRow title="Celkem" right={<Text style={typography.h3}>{formatCurrency(order.total)}</Text>} />
        </Card>
      </Section>

      <Section title="Další kroky">
        <Card>
          <Button
            title="Podpora k objednávce"
            variant="secondary"
            onPress={() =>
              router.push({ pathname: "/more/[screen]", params: { screen: "support", orderId } })
            }
          />
          <Button
            title="Požádat o vrácení"
            variant="ghost"
            onPress={() =>
              router.push({ pathname: "/more/[screen]", params: { screen: "returns", orderId } })
            }
          />
          <Button title="Stáhnout fakturu" variant="ghost" />
        </Card>
      </Section>
    </Screen>
  );
}

export function CheckoutScreen() {
  const { t, locale } = useI18n();
  const selectedCity = useAppStore((state) => state.selectedCity);
  const session = useAuthStore((state) => state.session);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const selectedPickupPoint = useCommerceStore((state) => state.selectedPickupPoint);
  const selectedDeliveryMethod = useCommerceStore((state) => state.selectedDeliveryMethod);
  const selectedPaymentMethod = useCommerceStore((state) => state.selectedPaymentMethod);
  const setDraftContact = useCommerceStore((state) => state.setDraftContact);
  const selectDeliveryMethod = useCommerceStore((state) => state.selectDeliveryMethod);
  const selectPaymentMethod = useCommerceStore((state) => state.selectPaymentMethod);
  const clearCart = useCommerceStore((state) => state.clearCart);
  const clearCheckoutState = useCommerceStore((state) => state.clearCheckoutState);
  const { data: addresses } = useAddressesQuery();
  const { data: paymentMethods } = usePaymentMethodsQuery();
  const placeOrderMutation = usePlaceOrderMutation();
  const subtotal = cartItems.reduce((accumulator, item) => {
    const product = mockApi.products.find((candidate) => candidate.id === item.productId);
    return accumulator + (product?.price ?? 0) * item.quantity;
  }, 0);
  const deliveryFee = selectedDeliveryMethod === "courier" ? 99 : 0;
  const total = subtotal + deliveryFee - (subtotal > 3000 ? 150 : 0);

  const form = useForm({
    resolver: zodResolver(checkoutContactSchema),
    defaultValues: {
      fullName: session ? `${session.user.firstName} ${session.user.lastName}` : "",
      email: session?.user.email ?? "",
      phone: session?.user.phone ?? ""
    }
  });

  if (!session) {
    return (
      <Screen centered>
        <StateView
          title={t("checkout", "title")}
          subtitle={t("checkout", "requireAccount")}
          action={
            <Button
              title={t("common", "login")}
              onPress={() =>
                router.push({
                  pathname: "/auth",
                  params: { redirectTo: "/checkout" }
                })
              }
            />
          }
        />
      </Screen>
    );
  }

  if (!cartItems.length) {
    return (
      <Screen centered>
        <StateView
          title={locale === "cs" ? "Košík je prázdný" : "Your cart is empty"}
          subtitle={
            locale === "cs" ? "Přidejte položky a vraťte se do pokladny." : "Add items and return to checkout."
          }
          action={<Button title={t("common", "continueShopping")} onPress={() => router.replace("/catalog")} />}
        />
      </Screen>
    );
  }

  const cityName = cityOptions.find((item) => item.id === selectedCity)?.label[locale] ?? selectedCity;

  return (
    <Screen>
      <ScreenHeader center={<BrandPill compact />} />

      <Section title={`1. ${t("checkout", "contact")}`}>
        <Card>
          <Controller
            control={form.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <TextField
                label="Jméno a příjmení"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                label="E-mail"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={form.control}
            name="phone"
            render={({ field, fieldState }) => (
              <TextField
                label="Telefon"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                keyboardType="phone-pad"
              />
            )}
          />
        </Card>
      </Section>

      <Section title={`2. ${t("checkout", "deliveryStep")}`}>
        <Card>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {(["pickup_point", "locker", "courier", "store_pickup"] as DeliveryMethod[]).map((method) => (
              <Button
                key={method}
                title={method.replace("_", " ")}
                variant={selectedDeliveryMethod === method ? "secondary" : "ghost"}
                onPress={() => selectDeliveryMethod(method)}
              />
            ))}
          </View>
          <Button
            title={locale === "cs" ? "Vybrat pickup / adresu" : "Choose pickup / address"}
            variant="secondary"
            onPress={() => router.push({ pathname: "/more/[screen]", params: { screen: "pickup" } })}
          />
          {selectedPickupPoint ? (
            <Text style={typography.bodySmall}>
              {locale === "cs" ? "Vybráno" : "Selected"}: {selectedPickupPoint.name}, {selectedPickupPoint.address}
            </Text>
          ) : null}
          {addresses?.[0] ? (
            <Text style={typography.bodySmall}>
              {locale === "cs" ? "Výchozí adresa" : "Default address"}: {addresses[0].street}, {addresses[0].city}
            </Text>
          ) : null}
          <Text style={typography.bodySmall}>
            {locale === "cs" ? "Aktivní město" : "Active city"}: {cityName}
          </Text>
        </Card>
      </Section>

      <Section title={`3. ${t("checkout", "paymentStep")}`}>
        <Card>
          <View style={{ gap: spacing.sm }}>
            {(paymentMethods ?? []).map((method) => (
              <ListRow
                key={method.id}
                title={method.label}
                subtitle={method.type.replace("_", " ")}
                right={
                  <Ionicons
                    name={selectedPaymentMethod === method.type ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={colors.primary}
                  />
                }
                onPress={() => selectPaymentMethod(method.type)}
              />
            ))}
          </View>
          <Text style={typography.bodySmall}>
            {locale === "cs"
              ? "Apple Pay / Google Pay / PSP integration layer je připravena v architektuře."
              : "The Apple Pay / Google Pay / PSP integration layer is already prepared in the architecture."}
          </Text>
        </Card>
      </Section>

      <Section title={`4. ${t("checkout", "summaryStep")}`}>
        <Card>
          {cartItems.map((item) => {
            const product = mockApi.products.find((candidate) => candidate.id === item.productId);
            return (
              <ListRow
                key={item.id}
                title={product?.name ?? "Produkt"}
                subtitle={`${item.quantity} × ${formatCurrency(product?.price ?? 0)}`}
              />
            );
          })}
          <ListRow title="Subtotal" right={<Text style={typography.body}>{formatCurrency(subtotal)}</Text>} />
          <ListRow
            title="Delivery"
            right={<Text style={typography.body}>{formatCurrency(deliveryFee)}</Text>}
          />
          <ListRow
            title="Discount"
            right={<Text style={typography.body}>{formatCurrency(subtotal > 3000 ? 150 : 0)}</Text>}
          />
          <ListRow title="Celkem" right={<Text style={typography.h3}>{formatCurrency(total)}</Text>} />
        </Card>
      </Section>

      <Button
        title={placeOrderMutation.isPending ? t("common", "loading") : t("common", "placeOrder")}
        variant="accent"
        onPress={form.handleSubmit(async (values) => {
          setDraftContact({
            firstName: values.fullName.split(" ")[0] ?? values.fullName,
            lastName: values.fullName.split(" ").slice(1).join(" "),
            email: values.email,
            phone: values.phone
          });
          analytics.track("begin_checkout", {
            items: cartItems.length,
            total
          });
          const order = await placeOrderMutation.mutateAsync({
            cartItems: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            deliveryMethod: selectedDeliveryMethod,
            pickupPointId: selectedPickupPoint?.id,
            addressId: addresses?.[0]?.id,
            paymentMethod: selectedPaymentMethod
          });
          analytics.track("order_created", { orderId: order.id, total: order.total });
          clearCart();
          clearCheckoutState();
          router.replace(`/order/${order.id}`);
        })}
      />
      <Text style={typography.bodySmall}>
        {locale === "cs"
          ? "Pokud backend vrátí price change nebo unavailable item, tato vrstva je připravena zobrazit blokující chybu před finálním potvrzením."
          : "If the backend returns a price change or unavailable item, this layer is ready to block checkout before final confirmation."}
      </Text>
    </Screen>
  );
}

export function AuthScreen({ redirectTo }: { redirectTo?: string }) {
  const login = useAuthStore((state) => state.login);
  const mutation = useLoginMutation();
  const { t } = useI18n();
  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      firstName: "Klára",
      lastName: "Nováková",
      email: "klara@example.com",
      phone: "+420777123123"
    }
  });

  return (
    <Screen>
      <ScreenHeader center={<BrandPill compact />} close fallbackRoute="/" />

      <Card>
        <Text style={typography.h1}>{t("auth", "title")}</Text>
        <Text style={typography.bodySmall}>{t("auth", "subtitle")}</Text>
      </Card>

      <Card>
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <TextField
              label={t("auth", "firstName")}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <TextField
              label={t("auth", "lastName")}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              label={t("auth", "phone")}
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label={t("auth", "email")}
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="none"
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          title={mutation.isPending ? t("common", "loading") : t("auth", "continueWithEmail")}
          variant="accent"
          onPress={form.handleSubmit(async (values) => {
            analytics.track("sign_up_started", { channel: "email" });
            const session = await mutation.mutateAsync(values);
            await login(session);
            analytics.track("sign_up_completed", { userId: session.user.id });
            if (redirectTo === "/checkout") {
              router.replace("/checkout");
              return;
            }
            router.back();
          })}
        />
        <Button title={t("auth", "continueWithApple")} variant="secondary" />
        <Button title={t("auth", "continueWithGoogle")} variant="secondary" />
        <Button title={t("auth", "phoneOtp")} variant="ghost" />
        <Text style={typography.bodySmall}>{t("auth", "legal")}</Text>
        <Text style={typography.bodySmall}>{t("auth", "guestHint")}</Text>
      </Card>

      <Button title={t("common", "guest")} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

export function MoreScreen({
  screen,
  sellerId,
  productId,
  orderId
}: {
  screen: string;
  sellerId?: string;
  productId?: string;
  orderId?: string;
}) {
  const session = useAuthStore((state) => state.session);
  const favoriteIds = useCommerceStore((state) => state.favoriteIds);
  const cartItems = useCommerceStore((state) => state.cartItems);
  const toggleFavorite = useCommerceStore((state) => state.toggleFavorite);
  const addToCart = useCommerceStore((state) => state.addToCart);
  const selectPickupPoint = useCommerceStore((state) => state.selectPickupPoint);
  const { locale, setLocale } = useI18n();
  const { data: notifications } = useNotificationsQuery();
  const { data: addresses } = useAddressesQuery();
  const { data: pickupPoints } = usePickupPointsQuery();
  const { data: seller } = useSellerQuery(sellerId ?? "");
  const { data: sellerProducts } = useSellerProductsQuery(sellerId ?? "");
  const { data: reviews } = useProductReviewsQuery(productId ?? "p1");
  const addressMutation = useAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Domov",
      fullName: session ? `${session.user.firstName} ${session.user.lastName}` : "",
      phone: session?.user.phone ?? "",
      street: "",
      city: "Praha",
      postalCode: ""
    }
  });

  const supportForm = useForm({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      topic: orderId ? `Issue with ${orderId}` : "General support",
      message: productId ? `Dotaz k produktu ${productId}` : ""
    }
  });

  const reviewForm = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      text: ""
    }
  });

  const returnForm = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      reason: "Damaged item",
      note: orderId ? `Return request for ${orderId}` : ""
    }
  });

  if (!session && ["favorites", "notifications", "addresses", "support", "returns"].includes(screen)) {
    return (
      <Screen>
        <StateView
          title="Tato část vyžaduje účet"
          subtitle="Po přihlášení zpřístupníme oblíbené, adresy, podporu a další soukromá data."
          action={<Button title="Přihlásit se" onPress={() => router.push("/auth")} />}
        />
      </Screen>
    );
  }

  if (screen === "favorites") {
    const favoriteProducts = mockApi.products.filter((product) => favoriteIds.includes(product.id));

    return (
      <Screen>
        <Section title="Oblíbené produkty">
          {favoriteProducts.length ? (
            <View style={{ gap: spacing.md }}>
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  fullWidth
                  isFavorite
                  cartQuantity={getCartQuantity(cartItems, product.id)}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                  onAddToCart={() => addToCart(product)}
                  onPress={() => router.push(`/product/${product.id}`)}
                />
              ))}
            </View>
          ) : (
            <StateView
              title="Oblíbené je zatím prázdné"
              subtitle="Uložte si produkty pro pozdější porovnání."
            />
          )}
        </Section>
      </Screen>
    );
  }

  if (screen === "notifications") {
    return (
      <Screen>
        <Section title="Notification center">
          <View style={{ gap: spacing.md }}>
            {notifications?.map((item) => (
              <Card key={item.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={typography.body}>{item.title}</Text>
                    <Text style={typography.bodySmall}>{item.body}</Text>
                  </View>
                  <Chip label={item.category} active={item.unread} />
                </View>
              </Card>
            ))}
          </View>
        </Section>
      </Screen>
    );
  }

  if (screen === "addresses") {
    return (
      <Screen>
        <Section title="Adresy">
          <View style={{ gap: spacing.md }}>
            {addresses?.map((address) => (
              <Card key={address.id}>
                <Text style={typography.body}>{address.label}</Text>
                <Text style={typography.bodySmall}>
                  {address.street}, {address.city} {address.postalCode}
                </Text>
                <Text style={typography.bodySmall}>{address.phone}</Text>
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  <Button title="Upravit" variant="secondary" onPress={() => setAddressSheetOpen(true)} />
                  <Button
                    title="Smazat"
                    variant="ghost"
                    onPress={() => deleteAddressMutation.mutate(address.id)}
                  />
                </View>
              </Card>
            ))}
            <Button title="Přidat adresu" onPress={() => setAddressSheetOpen(true)} />
          </View>
        </Section>

        <BottomSheet visible={addressSheetOpen} onClose={() => setAddressSheetOpen(false)} title="Adresa">
          <Controller
            control={addressForm.control}
            name="label"
            render={({ field, fieldState }) => (
              <TextField
                label="Štítek"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={addressForm.control}
            name="fullName"
            render={({ field, fieldState }) => (
              <TextField
                label="Jméno"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={addressForm.control}
            name="phone"
            render={({ field, fieldState }) => (
              <TextField
                label="Telefon"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={addressForm.control}
            name="street"
            render={({ field, fieldState }) => (
              <TextField
                label="Ulice"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={addressForm.control}
            name="city"
            render={({ field, fieldState }) => (
              <TextField
                label="Město"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={addressForm.control}
            name="postalCode"
            render={({ field, fieldState }) => (
              <TextField
                label="PSČ"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
          <Button
            title="Uložit adresu"
            onPress={addressForm.handleSubmit(async (values) => {
              await addressMutation.mutateAsync(values as Omit<Address, "id" | "isDefault">);
              setAddressSheetOpen(false);
              addressForm.reset();
            })}
          />
        </BottomSheet>
      </Screen>
    );
  }

  if (screen === "pickup") {
    return (
      <Screen>
        <Section title="Výběr pickup pointu" subtitle="List view now, map-ready adapter later">
          <SearchField placeholder="Hledat pickup point" />
          <View style={{ gap: spacing.md }}>
            {pickupPoints?.map((point) => (
              <Card key={point.id}>
                <Text style={typography.body}>{point.name}</Text>
                <Text style={typography.bodySmall}>{point.address}</Text>
                <Text style={typography.bodySmall}>
                  {point.distanceKm} km • {point.opensAt}-{point.closesAt}
                </Text>
                <Text style={typography.bodySmall}>{point.availability}</Text>
                <Button
                  title="Vybrat"
                  onPress={() => {
                    selectPickupPoint(point);
                    router.back();
                  }}
                />
              </Card>
            ))}
          </View>
        </Section>
      </Screen>
    );
  }

  if (screen === "support") {
    return (
      <Screen>
        <Section
          title="Podpora"
          subtitle="Order-related issue, refund, damaged item, wrong item, not received"
        >
          <Card>
            <Controller
              control={supportForm.control}
              name="topic"
              render={({ field, fieldState }) => (
                <TextField
                  label="Téma"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={supportForm.control}
              name="message"
              render={({ field, fieldState }) => (
                <TextField
                  label="Zpráva"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                  multiline
                  numberOfLines={5}
                />
              )}
            />
            <Button
              title="Odeslat ticket"
              onPress={supportForm.handleSubmit(async () => {
                analytics.track("support_contacted", { orderId, productId });
                Alert.alert("Support ticket", "Ticket byl odeslán v mock režimu.");
              })}
            />
            <Button
              title="Napsat e-mail"
              variant="ghost"
              onPress={() => void externalLinks.email(appConfig.contactEmail)}
            />
            <Button
              title="Zavolat na podporu"
              variant="ghost"
              onPress={() => void externalLinks.call(appConfig.supportPhone)}
            />
          </Card>
        </Section>
      </Screen>
    );
  }

  if (screen === "returns") {
    return (
      <Screen>
        <Section
          title="Request return"
          subtitle="Photo upload and refund method are architecture-ready placeholders"
        >
          <Card>
            <Controller
              control={returnForm.control}
              name="reason"
              render={({ field, fieldState }) => (
                <TextField
                  label="Důvod"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={returnForm.control}
              name="note"
              render={({ field, fieldState }) => (
                <TextField
                  label="Poznámka"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            <Button
              title="Požádat o vrácení"
              onPress={returnForm.handleSubmit(() => {
                Alert.alert("Return flow", "Žádost o vrácení byla uložena v mock režimu.");
              })}
            />
          </Card>
        </Section>
      </Screen>
    );
  }

  if (screen === "reviews") {
    return (
      <Screen>
        <Section title="Recenze produktu">
          <Card>
            {reviews?.map((review) => (
              <View key={review.id} style={{ gap: 4 }}>
                <Text style={typography.body}>{review.author}</Text>
                <Text style={typography.bodySmall}>{review.rating}★</Text>
                <Text style={typography.bodySmall}>{review.text}</Text>
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Přidat recenzi">
          <Card>
            <Controller
              control={reviewForm.control}
              name="text"
              render={({ field, fieldState }) => (
                <TextField
                  label="Text recenze"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
            <Button
              title="Odeslat recenzi"
              onPress={reviewForm.handleSubmit(() => {
                analytics.track("review_submitted", { productId });
                Alert.alert("Review", "Recenze byla uložena v mock režimu.");
              })}
            />
          </Card>
        </Section>
      </Screen>
    );
  }

  if (screen === "seller") {
    return (
      <Screen>
        <Card>
          <Text style={typography.h1}>{seller?.name ?? "Seller"}</Text>
          <Text style={typography.bodySmall}>Rating {seller?.rating}</Text>
          <Text style={typography.bodySmall}>{seller?.deliverySpeed}</Text>
          <Text style={typography.bodySmall}>{seller?.returnPolicy}</Text>
        </Card>

        <Section title="Produkty prodejce">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md }}
          >
            {sellerProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                isFavorite={favoriteIds.includes(product.id)}
                cartQuantity={getCartQuantity(cartItems, product.id)}
                onToggleFavorite={() => toggleFavorite(product.id)}
                onAddToCart={() => addToCart(product)}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            ))}
          </ScrollView>
        </Section>
      </Screen>
    );
  }

  if (screen === "legal") {
    return (
      <Screen>
        <Section title="Legal / privacy">
          <Card>
            {[
              "Terms",
              "Privacy Policy",
              "Returns Policy",
              "Complaint Policy",
              "Marketplace info",
              "Account deletion / data export hooks"
            ].map((item) => (
              <ListRow
                key={item}
                title={item}
                subtitle="Configurable text layer, EU privacy by design ready"
              />
            ))}
          </Card>
        </Section>
      </Screen>
    );
  }

  if (screen === "settings") {
    return (
      <Screen>
        <Section title="Settings">
          <Card>
            <ListRow
              title={`Language: ${locale.toUpperCase()}`}
              subtitle="CZ default, EN future-ready"
              onPress={() => setLocale(locale === "cs" ? "en" : "cs")}
            />
            <ListRow
              title="Analytics preferences"
              subtitle="Consent placeholder for web-compatible ecosystem"
            />
            <ListRow title="Cookie / consent settings" subtitle="Privacy-friendly toggles prepared" />
            <ListRow title="App version" subtitle={Constants.expoConfig?.version ?? "1.0.0"} />
          </Card>
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <StateView title="Screen not configured" subtitle={`Unknown route: ${screen}`} />
    </Screen>
  );
}
