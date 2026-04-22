import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { ConfirmationDialog } from "@/src/components/confirmation-dialog";
import { PrimaryButton } from "@/src/components/primary-button";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";
import { apiUrl, queryKeys } from "@/src/lib/config";
import { formatBytes, formatDate } from "@/src/lib/utils";
import type { ItemDetail } from "@/src/types/api";

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { authorizedFetch, getAccessToken } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const itemQuery = useQuery({
    queryKey: queryKeys.item(itemId),
    queryFn: async () => {
      const response = await authorizedFetch(`/api/items/${itemId}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Položku se nepodařilo načíst.");
      }

      return payload.item as ItemDetail;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await authorizedFetch(`/api/items/${itemId}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Položku se nepodařilo smazat.");
      }
    },
    onSuccess: () => {
      toast.success("Položka byla smazána");
      void queryClient.invalidateQueries();
      router.back();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Položku se nepodařilo smazat.");
    }
  });

  async function handleOpenLink() {
    const url = itemQuery.data?.link?.url;
    if (!url) {
      return;
    }

    await Linking.openURL(url);
  }

  async function handleDownload() {
    if (!itemQuery.data?.file) {
      return;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error("Relace vypršela.");
      return;
    }

    try {
      setDownloading(true);
      const destination = `${FileSystem.cacheDirectory}${itemQuery.data.file.originalName}`;
      await FileSystem.downloadAsync(`${apiUrl}/api/items/${itemId}/download`, destination, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      await Sharing.shareAsync(destination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Stažení souboru se nezdařilo.");
    } finally {
      setDownloading(false);
    }
  }

  const item = itemQuery.data;

  return (
    <Screen scroll>
      <View className="gap-4 py-4">
        <Text className="text-3xl font-bold text-slate-950">{item?.name ?? "Detail položky"}</Text>
        {item ? (
          <View className="gap-4 rounded-[28px] bg-white p-5">
            <Text className="text-sm text-slate-500">Autor: {item.author.name}</Text>
            <Text className="text-sm text-slate-500">Vytvořeno: {formatDate(item.createdAt)}</Text>
            <Text className="text-sm text-slate-500">Složka: {item.folder.name}</Text>

            {item.file ? (
              <>
                <Text className="text-sm text-slate-700">Původní název: {item.file.originalName}</Text>
                <Text className="text-sm text-slate-700">MIME typ: {item.file.mimeType}</Text>
                <Text className="text-sm text-slate-700">Velikost: {formatBytes(item.file.size)}</Text>
                <PrimaryButton
                  title={downloading ? "Stahuji..." : "Otevřít / stáhnout soubor"}
                  onPress={() => void handleDownload()}
                  loading={downloading}
                />
              </>
            ) : null}

            {item.link ? (
              <>
                <Text className="text-sm text-slate-700">URL: {item.link.url}</Text>
                {item.link.description ? (
                  <Text className="text-sm text-slate-700">Popis: {item.link.description}</Text>
                ) : null}
                <PrimaryButton title="Otevřít odkaz" onPress={() => void handleOpenLink()} />
              </>
            ) : null}

            {item.canManage ? (
              <Pressable onPress={() => setDeleteOpen(true)} className="mt-2 items-center py-2">
                <Text className="text-sm font-semibold text-rose-600">Smazat položku</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <Text className="text-sm text-slate-500">Načítání položky…</Text>
        )}
      </View>

      <ConfirmationDialog
        open={deleteOpen}
        title="Smazat položku"
        description="Tato akce odstraní soubor nebo odkaz natrvalo."
        confirmLabel="Smazat položku"
        onConfirm={() => {
          setDeleteOpen(false);
          deleteMutation.mutate();
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </Screen>
  );
}
