import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useEffect, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewStyle
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { useI18n } from "@/i18n";
import { colors, layout, radius, shadows, spacing, typography } from "@/theme";
import { formatCurrency, formatShortDate, getDiscountPercent } from "@/utils";
import type { OrderStatus, Product } from "@/types/domain";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  centered?: boolean;
};

export function Screen({ children, scroll = true, contentStyle, centered = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        {
          flexGrow: 1,
          paddingHorizontal: layout.pagePadding,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: spacing.xxxxl,
          gap: spacing.lg,
          justifyContent: centered ? "center" : undefined
        },
        contentStyle
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) {
    return <View style={styles.screen}>{content}</View>;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xxxxl }}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

export function BrandPill({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.brandPill, compact && { paddingHorizontal: spacing.md, height: 30 }]}>
      <Text style={[styles.brandText, compact && { fontSize: 14 }]} accessibilityRole="header">
        velora
      </Text>
    </View>
  );
}

export function ScreenHeader({
  title,
  center,
  close,
  fallbackRoute = "/"
}: {
  title?: string;
  center?: ReactNode;
  close?: boolean;
  fallbackRoute?: string;
}) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackRoute as never);
  };

  return (
    <View style={styles.screenHeader}>
      <Pressable style={styles.headerActionButton} onPress={handleBack} accessibilityRole="button">
        <Ionicons name={close ? "close" : "chevron-back"} size={20} color={colors.textMain} />
      </Pressable>
      <View style={styles.screenHeaderCenter}>
        {center ?? (title ? <Text style={styles.screenHeaderTitle}>{title}</Text> : null)}
      </View>
      <View style={styles.screenHeaderSpacer} />
    </View>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={typography.h2}>{title}</Text>
          {subtitle ? <Text style={typography.bodySmall}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  icon
}: {
  label: string;
  active?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? colors.primary : colors.textSecondary} />
      ) : null}
      <Text style={[typography.label, { color: active ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

export function Button({
  title,
  variant = "primary",
  icon,
  ...props
}: PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const style =
    variant === "primary"
      ? styles.primaryButton
      : variant === "secondary"
        ? styles.secondaryButton
        : variant === "accent"
          ? styles.accentButton
          : styles.ghostButton;

  const textStyle =
    variant === "primary"
      ? styles.primaryButtonText
      : variant === "secondary"
        ? styles.secondaryButtonText
        : variant === "accent"
          ? styles.accentButtonText
          : styles.ghostButtonText;

  return (
    <Pressable style={({ pressed }) => [style, pressed && { opacity: 0.9 }]} {...props}>
      {icon ? <Ionicons name={icon} size={18} color={textStyle.color} /> : null}
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

export function SearchField({
  trailing,
  ...props
}: TextInputProps & {
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.searchField}>
      <Ionicons name="search-outline" size={22} color={colors.textMuted} />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={{ flex: 1, ...typography.body, fontSize: 16 }}
        {...props}
      />
      {trailing}
    </View>
  );
}

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={typography.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.textField, error ? { borderColor: colors.danger } : null]}
        {...props}
      />
      {error ? <Text style={[typography.bodySmall, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function StateView({
  title,
  subtitle,
  icon = "sparkles-outline",
  action
}: {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: ReactNode;
}) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: spacing.xxxxl }}>
      <View style={styles.stateIcon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[typography.h2, { textAlign: "center" }]}>{title}</Text>
      <Text style={[typography.bodySmall, { textAlign: "center", maxWidth: 260 }]}>{subtitle}</Text>
      {action}
    </Card>
  );
}

export function BannerCard({
  title,
  subtitle,
  imageUrl,
  cta
}: {
  title: string;
  subtitle: string;
  imageUrl: string;
  cta: string;
}) {
  return (
    <View style={styles.bannerCard}>
      <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerOrbLeft} />
      <View style={styles.bannerOrbRight} />
      <View style={styles.bannerWave}>
        <Svg width="190" height="130" viewBox="0 0 190 130">
          <Path d="M0 28C35 0 64 0 108 0C152 0 169 18 190 36V130H0V28Z" fill="rgba(255,255,255,0.15)" />
        </Svg>
      </View>
      <View style={{ gap: spacing.sm, maxWidth: "72%" }}>
        <Text style={[typography.h1, { color: colors.card }]}>{title}</Text>
        <Text style={[typography.body, { color: "rgba(255,255,255,0.92)" }]}>{subtitle}</Text>
        <View style={styles.bannerCta}>
          <Text style={[typography.label, { color: colors.primaryDark }]}>{cta}</Text>
        </View>
      </View>
    </View>
  );
}

export function ProductCard({
  product,
  isFavorite,
  cartQuantity = 0,
  onToggleFavorite,
  onPress,
  onAddToCart,
  compact,
  fullWidth
}: {
  product: Product;
  isFavorite?: boolean;
  cartQuantity?: number;
  onToggleFavorite?: () => void;
  onPress?: () => void;
  onAddToCart?: () => void;
  compact?: boolean;
  fullWidth?: boolean;
}) {
  const { locale, t } = useI18n();
  const hasDiscount = Boolean(product.oldPrice);
  const isInCart = cartQuantity > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.productCard,
        compact && { width: 228 },
        fullWidth && { width: "100%" },
        pressed && { opacity: 0.96 }
      ]}
      accessibilityLabel={product.name}
    >
      <View style={styles.productImageWrap}>
        <Image source={{ uri: product.images[0] }} style={styles.productImage} contentFit="cover" />
        <View style={styles.productTopActions}>
          <View style={styles.imageUtilityButton}>
            <Ionicons name="scan-outline" size={16} color={colors.darkCard} />
          </View>
          <Pressable style={styles.imageUtilityButton} onPress={onToggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={17}
              color={isFavorite ? colors.primary : colors.darkCard}
            />
          </Pressable>
        </View>
        {hasDiscount ? (
          <View style={styles.saleBadge}>
            <Text style={[typography.label, { color: "#D94600" }]}>-{getDiscountPercent(product)}%</Text>
          </View>
        ) : null}
        {onAddToCart ? (
          <Pressable
            style={[styles.floatingCartButton, isInCart && styles.floatingCartButtonActive]}
            onPress={onAddToCart}
            accessibilityRole="button"
            accessibilityLabel={isInCart ? t("common", "inCart") : t("common", "addToCart")}
          >
            <Ionicons
              name={isInCart ? "checkmark" : "bag-add-outline"}
              size={20}
              color={colors.card}
            />
            {isInCart ? <Text style={styles.floatingCartButtonText}>{cartQuantity}</Text> : null}
          </Pressable>
        ) : null}
      </View>
      <View style={{ gap: 6 }}>
        <Text numberOfLines={2} style={styles.productTitle}>
          {product.name}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          {product.oldPrice ? (
            <Text style={styles.productOldPrice}>{formatCurrency(product.oldPrice)}</Text>
          ) : null}
        </View>
        <Text style={styles.productMeta}>
          {product.pickupToday
            ? locale === "cs"
              ? "Vyzvednutí dnes"
              : "Pickup today"
            : locale === "cs"
              ? "Doručení zítra"
              : "Delivery tomorrow"}
        </Text>
        <Text numberOfLines={1} style={styles.productSeller}>
          {product.brand}
        </Text>
        <View style={styles.productRatingRow}>
          <Ionicons name="star" size={14} color={colors.warning} />
          <Text style={typography.bodySmall}>
            {product.rating} · {product.reviewCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ListRow({
  title,
  subtitle,
  right,
  onPress,
  icon = "chevron-forward"
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && { opacity: 0.9 }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={typography.body}>{title}</Text>
        {subtitle ? <Text style={typography.bodySmall}>{subtitle}</Text> : null}
      </View>
      {right ?? <Ionicons name={icon} size={18} color={colors.textSecondary} />}
    </Pressable>
  );
}

export function SkeletonBlock({ height, width = "100%" }: { height: number; width?: number | `${number}%` }) {
  return <View style={[styles.skeleton, { height, width }]} />;
}

export function QuantityStepper({
  value,
  onChange
}: {
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={() => onChange(value - 1)} style={styles.stepperButton}>
        <Ionicons name="remove" size={18} color={colors.primaryDark} />
      </Pressable>
      <Text style={[typography.body, { fontWeight: "800" }]}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={styles.stepperButton}>
        <Ionicons name="add" size={18} color={colors.primaryDark} />
      </Pressable>
    </View>
  );
}

export function Timeline({ items }: { items: { label: string; date: string; active?: boolean }[] }) {
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((item, index) => (
        <View key={`${item.label}-${item.date}`} style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={[styles.timelineDot, { backgroundColor: item.active ? colors.primary : colors.border }]}
            />
            {index !== items.length - 1 ? <View style={styles.timelineLine} /> : null}
          </View>
          <View style={{ paddingBottom: spacing.md, gap: 4 }}>
            <Text style={[typography.body, { fontWeight: item.active ? "700" : "500" }]}>{item.label}</Text>
            <Text style={typography.bodySmall}>{formatShortDate(item.date)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const palette =
    status === "delivered"
      ? colors.success
      : status === "cancelled" || status === "returned"
        ? colors.danger
        : status === "ready_for_pickup"
          ? colors.accent
          : colors.primary;

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${palette}16` }]}>
      <Text style={[typography.label, { color: palette }]}>{status.replaceAll("_", " ")}</Text>
    </View>
  );
}

export function BottomSheet({
  visible,
  title,
  onClose,
  children
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [progress, visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 280 }],
    opacity: progress.value
  }));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.sheetHandle} />
          <Text style={typography.h2}>{title}</Text>
          <View style={{ gap: spacing.md }}>{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export function FixedBottomBar({ children }: { children: ReactNode }) {
  return <View style={styles.fixedBottomBar}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  brandPill: {
    alignSelf: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minWidth: 108,
    height: 36,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card
  },
  screenHeader: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  screenHeaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  screenHeaderTitle: {
    ...typography.h3,
    textAlign: "center"
  },
  screenHeaderSpacer: {
    width: 40,
    height: 40
  },
  brandText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: "800"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipActive: {
    backgroundColor: colors.chipBg,
    borderColor: "transparent"
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  accentButton: {
    minHeight: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  ghostButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "800"
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.primaryDark,
    fontWeight: "700"
  },
  accentButtonText: {
    ...typography.body,
    color: colors.card,
    fontWeight: "800"
  },
  ghostButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "700"
  },
  searchField: {
    minHeight: 62,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    ...shadows.card
  },
  textField: {
    ...typography.body,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg
  },
  stateIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  bannerCard: {
    minHeight: 212,
    borderRadius: radius.lg,
    overflow: "hidden",
    padding: spacing.xl,
    justifyContent: "flex-end",
    backgroundColor: colors.hero,
    ...shadows.floating
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(67,31,142,0.42)"
  },
  bannerOrbLeft: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -35,
    top: 18,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  bannerOrbRight: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -60,
    bottom: -40,
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  bannerWave: {
    position: "absolute",
    top: 0,
    right: 0
  },
  bannerCta: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill
  },
  productCard: {
    width: "48.4%",
    gap: spacing.md
  },
  productImageWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    aspectRatio: layout.productImageRatio,
    backgroundColor: colors.muted,
    ...shadows.card
  },
  productImage: {
    width: "100%",
    height: "100%"
  },
  productTopActions: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  imageUtilityButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  saleBadge: {
    position: "absolute",
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.saleBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill
  },
  floatingCartButton: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floating
  },
  floatingCartButtonActive: {
    width: "auto",
    minWidth: 64,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    gap: 6
  },
  floatingCartButtonText: {
    ...typography.label,
    color: colors.card
  },
  productTitle: {
    ...typography.body,
    fontWeight: "700"
  },
  productPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  productPrice: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.textMain
  },
  productOldPrice: {
    ...typography.bodySmall,
    textDecorationLine: "line-through"
  },
  productMeta: {
    ...typography.label,
    color: colors.primary
  },
  productSeller: {
    ...typography.bodySmall,
    color: colors.textMain
  },
  productRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  listRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm
  },
  skeleton: {
    backgroundColor: colors.muted,
    borderRadius: radius.md
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 8
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23,19,33,0.32)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxxl,
    gap: spacing.lg
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    alignSelf: "center"
  },
  fixedBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: layout.pagePadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    ...shadows.floating
  }
});
