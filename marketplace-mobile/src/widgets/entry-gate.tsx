import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { countryOptions } from "@/constants/marketplace";
import { useI18n } from "@/i18n";
import { BrandPill, Button, Card } from "@/shared/ui";
import { useAppStore } from "@/store";
import { colors, radius, spacing, typography } from "@/theme";

const localize = (value: { cs: string; en: string }, locale: "cs" | "en") => value[locale];

export function EntryGate() {
  const { locale, setLocale, t } = useI18n();
  const selectCountry = useAppStore((state) => state.selectCountry);

  return (
    <View style={styles.screen}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <BrandPill />
          <Pressable style={styles.languageSwitch} onPress={() => setLocale(locale === "cs" ? "en" : "cs")}>
            <Ionicons name="language-outline" size={16} color={colors.card} />
            <Text style={styles.languageText}>{locale.toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm, marginTop: spacing.xxxxl }}>
          <Text style={[typography.hero, { color: colors.card, textAlign: "center" }]}>{t("entry", "title")}</Text>
          <Text style={[typography.body, { color: "rgba(255,255,255,0.86)", textAlign: "center" }]}>
            {t("entry", "subtitle")}
          </Text>
        </View>

        <Card style={styles.countryCard}>
          <View style={{ gap: spacing.sm }}>
            <Text style={typography.label}>{t("entry", "availableCountry")}</Text>
            {countryOptions
              .filter((country) => country.enabled)
              .map((country) => (
                <Pressable
                  key={country.id}
                  style={({ pressed }) => [styles.countryRow, pressed && { opacity: 0.92 }]}
                  onPress={() => void selectCountry("cz")}
                >
                  <View style={styles.countryFlagWrap}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.countryTitle}>{localize(country.label, locale)}</Text>
                    {country.note ? (
                      <Text style={typography.bodySmall}>{localize(country.note, locale)}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
          </View>

          <View style={styles.divider} />

          <View style={{ gap: spacing.sm }}>
            <Text style={typography.label}>{t("entry", "comingSoonCountries")}</Text>
            {countryOptions
              .filter((country) => !country.enabled)
              .map((country) => (
                <View key={country.id} style={[styles.countryRow, styles.countryRowMuted]}>
                  <View style={styles.countryFlagWrap}>
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                  </View>
                  <Text style={[styles.countryTitle, { color: colors.textSecondary }]}>
                    {localize(country.label, locale)}
                  </Text>
                  <Text style={styles.comingSoonText}>{t("common", "comingSoon")}</Text>
                </View>
              ))}
          </View>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: "rgba(255,255,255,0.85)", textAlign: "center" }]}>
            {t("entry", "chooseLanguage")}
          </Text>
          <View style={styles.languageRow}>
            <Button title="Čeština" variant={locale === "cs" ? "secondary" : "ghost"} onPress={() => setLocale("cs")} />
            <Button title="English" variant={locale === "en" ? "secondary" : "ghost"} onPress={() => setLocale("en")} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.hero,
    overflow: "hidden"
  },
  orbTop: {
    position: "absolute",
    top: -90,
    right: -30,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  orbBottom: {
    position: "absolute",
    left: -80,
    bottom: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
    justifyContent: "center"
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  languageSwitch: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6
  },
  languageText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "700"
  },
  countryCard: {
    borderWidth: 0,
    gap: spacing.lg
  },
  countryRow: {
    minHeight: 60,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  countryRowMuted: {
    backgroundColor: colors.surface
  },
  countryFlagWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center"
  },
  countryFlag: {
    fontSize: 20
  },
  countryTitle: {
    ...typography.body,
    fontWeight: "700"
  },
  divider: {
    height: 1,
    backgroundColor: colors.border
  },
  comingSoonText: {
    ...typography.label,
    color: colors.textMuted
  },
  languageRow: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
