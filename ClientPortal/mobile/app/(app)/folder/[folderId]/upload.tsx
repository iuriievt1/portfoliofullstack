import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { PrimaryButton } from "@/src/components/primary-button";
import { UploadQueueRow } from "@/src/components/upload-queue-row";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";
import { useUploadQueue } from "@/src/hooks/use-upload-queue";

export default function UploadScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { getAccessToken } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const queue = useUploadQueue(folderId, getAccessToken);

  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: "*/*"
    });

    if (!result.canceled) {
      queue.appendFiles(result.assets);
    }
  }

  async function handleUploadAll() {
    try {
      await queue.uploadAll();
      toast.success("Soubor byl nahrán");
      await queryClient.invalidateQueries();
      router.back();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nahrávání selhalo.");
    }
  }

  return (
    <Screen scroll>
      <View className="gap-4 py-4">
        <PrimaryButton title="Vybrat soubory" onPress={handlePick} />
        <Text className="text-sm text-slate-500">
          Vyberte jeden nebo více souborů z telefonu. Podporovány jsou všechny typy.
        </Text>

        <ScrollView contentContainerStyle={{ gap: 12 }}>
          {queue.items.map((item) => (
            <UploadQueueRow key={item.id} item={item} onRetry={() => void queue.retryUpload(item.id)} />
          ))}
        </ScrollView>

        <PrimaryButton
          title="Nahrát vše"
          onPress={() => void handleUploadAll()}
          disabled={!queue.items.length || !queue.hasPending}
        />
        <PrimaryButton title="Zavřít" onPress={() => router.back()} tone="secondary" />
      </View>
    </Screen>
  );
}
