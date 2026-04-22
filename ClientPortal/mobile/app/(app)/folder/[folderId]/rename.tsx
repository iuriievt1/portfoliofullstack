import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { TextField } from "@/src/components/text-field";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";
import { queryKeys } from "@/src/lib/config";
import type { FolderSummary } from "@/src/types/api";

export default function RenameFolderScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { authorizedFetch } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  useQuery({
    queryKey: queryKeys.folder(folderId),
    queryFn: async () => {
      const response = await authorizedFetch(`/api/folders/${folderId}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Složka nebyla nalezena.");
      }

      const folder = payload.folder as FolderSummary;
      setName(folder.name);
      setCategory(folder.category ?? "");
      return folder;
    }
  });

  const renameMutation = useMutation({
    mutationFn: async () => {
      const response = await authorizedFetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          category
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Složku se nepodařilo přejmenovat.");
      }
    },
    onSuccess: () => {
      toast.success("Složka byla přejmenována");
      void queryClient.invalidateQueries();
      router.back();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Složku se nepodařilo přejmenovat.");
    }
  });

  return (
    <Screen scroll>
      <View className="gap-5 py-4">
        <TextField label="Nový název" value={name} onChangeText={setName} placeholder="Název složky" />
        <TextField
          label="Kategorie"
          value={category}
          onChangeText={setCategory}
          placeholder="Kategorie"
        />
        <PrimaryButton
          title="Uložit změny"
          onPress={() => renameMutation.mutate()}
          loading={renameMutation.isPending}
        />
      </View>
    </Screen>
  );
}
