import { useState } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/src/components/screen";
import { SectionHeader } from "@/src/components/section-header";
import { TextField } from "@/src/components/text-field";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";

export default function LoginScreen() {
  const { signIn } = useSession();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);
      await signIn({ email, password });
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Přihlášení se nezdařilo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View className="flex-1 justify-center py-10">
        <View className="rounded-[32px] bg-white p-6">
          <SectionHeader
            title="Přihlášení"
            subtitle="Přihlaste se do klientského portálu a pokračujte do svých složek."
          />
          <View className="gap-4">
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="denisa@portal.local"
            />
            <TextField
              label="Heslo"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            <PrimaryButton title="Přihlásit se" onPress={handleSubmit} loading={loading} />
          </View>
          <Text className="mt-5 text-center text-sm text-slate-400">
            Mobilní aplikace používá bezpečné tokenové relace uložené v zařízení.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
