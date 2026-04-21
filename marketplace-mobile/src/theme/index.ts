import type { TextStyle, ViewStyle } from "react-native";

export const colors = {
  primary: "#B620E0",
  primaryDark: "#7E22CE",
  primarySoft: "#F7E8FF",
  accent: "#FF8A00",
  accentSoft: "#FFF2E2",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#F59E0B",
  background: "#F4F3F8",
  surface: "#FBFAFE",
  card: "#FFFFFF",
  textMain: "#171321",
  textSecondary: "#7B748F",
  textMuted: "#A59EB7",
  border: "#ECE6F4",
  muted: "#F1EDF7",
  chipBg: "#F6ECFF",
  saleBg: "#FFF4E8",
  hero: "#6D28D9",
  heroSecondary: "#DB39D6",
  darkCard: "#14111E"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999
} as const;

export const shadows = {
  card: {
    shadowColor: "#1B1330",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3
  } satisfies ViewStyle,
  floating: {
    shadowColor: "#1B1330",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 26,
    elevation: 6
  } satisfies ViewStyle
} as const;

export const typography = {
  hero: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.textMain
  } satisfies TextStyle,
  h1: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    color: colors.textMain
  } satisfies TextStyle,
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: colors.textMain
  } satisfies TextStyle,
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textMain
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMain
  } satisfies TextStyle,
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary
  } satisfies TextStyle,
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.textSecondary
  } satisfies TextStyle
} as const;

export const layout = {
  pagePadding: spacing.lg,
  cardGap: spacing.md,
  productImageRatio: 1.12,
  tabBarHeight: 76
} as const;
