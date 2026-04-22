import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { TextField } from "@/src/components/text-field";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";

export default function CreateFolderScreen() {
  const { parentId } = useLocalSearchParams<{ parentId?: string }>();
  const { authorizedFetch } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await authorizedFetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category,
          parentId
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Složku se nepodařilo vytvořit.");
      }

      return payload.folder;
    },
    onSuccess: () => {
      toast.success("Složka byla vytvořena");
      void queryClient.invalidateQueries();
      router.back();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Složku se nepodařilo vytvořit.");
    }
  });

  return (
    <Screen scroll>
      <View className="gap-5 py-4">
        <TextField label="Název složky" value={name} onChangeText={setName} placeholder="Např. Klienti" />
        <TextField
          label="Kategorie"
          value={category}
          onChangeText={setCategory}
          placeholder="Např. Mezinárodní ochrana"
        />
        <PrimaryButton
          title="Vytvořit složku"
          onPress={() => createMutation.mutate()}
          loading={createMutation.isPending}
        />
        {parentId ? <Text className="text-sm text-slate-500">Vytváříte podsložku.</Text> : null}
      </View>
    </Screen>
  );
}
