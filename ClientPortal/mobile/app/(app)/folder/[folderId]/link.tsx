import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { TextField } from "@/src/components/text-field";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";

export default function AddLinkScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { authorizedFetch } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await authorizedFetch(`/api/folders/${folderId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          url,
          description
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Odkaz se nepodařilo přidat.");
      }
    },
    onSuccess: () => {
      toast.success("Odkaz byl přidán");
      void queryClient.invalidateQueries();
      router.back();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Odkaz se nepodařilo přidat.");
    }
  });

  return (
    <Screen scroll>
      <View className="gap-5 py-4">
        <TextField label="Název odkazu" value={name} onChangeText={setName} placeholder="Např. Soudní portál" />
        <TextField
          label="URL adresa"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://..."
        />
        <TextField
          label="Popis"
          value={description}
          onChangeText={setDescription}
          placeholder="Volitelný popis"
          multiline
        />
        <PrimaryButton
          title="Přidat odkaz"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
        />
      </View>
    </Screen>
  );
}
