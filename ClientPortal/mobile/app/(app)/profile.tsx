import { router } from "expo-router";
import { Text, View } from "react-native";
import { Screen } from "@/src/components/screen";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";

export default function ProfileScreen() {
  const { user, signOut } = useSession();

  return (
    <Screen scroll>
      <View className="gap-5 py-4">
        <Text className="text-3xl font-bold text-slate-950">Profil / Odhlášení</Text>

        <View className="rounded-[28px] bg-white p-5">
          <Text className="text-base font-semibold text-slate-950">{user?.name}</Text>
          <Text className="mt-2 text-sm text-slate-500">E-mail: {user?.email}</Text>
          <Text className="mt-2 text-sm text-slate-500">Role: {user?.role}</Text>
          <Text className="mt-2 text-sm text-slate-500">ID uživatele: {user?.publicId}</Text>
        </View>

        <PrimaryButton
          title="Odhlásit se"
          onPress={() => {
            void signOut().then(() => router.replace("/login"));
          }}
          tone="secondary"
        />
      </View>
    </Screen>
  );
}
