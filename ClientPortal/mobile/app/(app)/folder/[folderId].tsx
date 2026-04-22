import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { SearchInput } from "@/src/components/search-input";
import { FilterSheet, type FilterState } from "@/src/components/filter-sheet";
import { FolderRow } from "@/src/components/folder-row";
import { ItemRow } from "@/src/components/item-row";
import { EmptyState } from "@/src/components/empty-state";
import { ConfirmationDialog } from "@/src/components/confirmation-dialog";
import { useSession } from "@/src/providers/session-provider";
import { useToast } from "@/src/providers/toast-provider";
import { buildQuery } from "@/src/lib/utils";
import { queryKeys } from "@/src/lib/config";
import { useDebouncedValue } from "@/src/hooks/use-debounced-value";
import type { ContentEntry, FolderSummary } from "@/src/types/api";

const initialFilters: FilterState = {
  sortBy: "newest",
  order: "desc",
  author: "",
  type: "",
  dateFrom: "",
  dateTo: "",
  sizeMin: "",
  sizeMax: ""
};

type FolderEntriesResponse = {
  folder: FolderSummary;
  entries: ContentEntry[];
};

export default function FolderDetailScreen() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const { authorizedFetch } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const queryString = useMemo(
    () =>
      buildQuery({
        search: debouncedSearch,
        author: filters.author,
        type: filters.type,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sizeMin: filters.sizeMin,
        sizeMax: filters.sizeMax,
        sortBy: filters.sortBy,
        order: filters.order
      }),
    [
      debouncedSearch,
      filters.author,
      filters.dateFrom,
      filters.dateTo,
      filters.order,
      filters.sizeMax,
      filters.sizeMin,
      filters.sortBy,
      filters.type
    ]
  );

  const folderQuery = useQuery({
    queryKey: queryKeys.folderEntries(folderId, queryString),
    queryFn: async () => {
      const response = await authorizedFetch(`/api/folders/${folderId}/items${queryString}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Nepodařilo se načíst obsah složky.");
      }

      return payload as FolderEntriesResponse;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await authorizedFetch(`/api/folders/${folderId}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Složku se nepodařilo smazat.");
      }
    },
    onSuccess: () => {
      toast.success("Položka byla smazána");
      void queryClient.invalidateQueries();
      router.back();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Složku se nepodařilo smazat.");
    }
  });

  const folder = folderQuery.data?.folder;
  const entries = folderQuery.data?.entries ?? [];

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={folderQuery.isRefetching} onRefresh={folderQuery.refetch} />}
      >
        <View className="pb-8 pt-4">
          <Text className="text-3xl font-bold text-slate-950">{folder?.name ?? "Detail složky"}</Text>
          <Text className="mt-2 text-sm text-slate-500">
            {folder?.category || "Bez kategorie"} · {folder?.author.name || ""}
          </Text>

          <View className="mt-5 gap-3">
            <SearchInput value={search} onChangeText={setSearch} placeholder="Hledat v této složce" />
            <View className="flex-row flex-wrap gap-3">
              {folder?.canManage ? (
                <>
                  <Pressable
                    onPress={() => router.push({ pathname: "/folder/create", params: { parentId: folderId } })}
                    className="rounded-3xl bg-primary px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-white">Podsložka</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push({ pathname: "/folder/[folderId]/upload", params: { folderId } })}
                    className="rounded-3xl bg-slate-900 px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-white">Nahrát soubory</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push({ pathname: "/folder/[folderId]/link", params: { folderId } })}
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">Přidat odkaz</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push({ pathname: "/folder/[folderId]/rename", params: { folderId } })}
                    className="rounded-3xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">Přejmenovat</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setDeleteOpen(true)}
                    className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-rose-700">Smazat</Text>
                  </Pressable>
                </>
              ) : null}
              <Pressable
                onPress={() => setFilterOpen(true)}
                className="rounded-3xl border border-slate-200 bg-white px-4 py-3"
              >
                <Text className="text-sm font-semibold text-slate-900">Filtry</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            {folderQuery.isLoading ? (
              <Text className="text-sm text-slate-500">Načítání obsahu…</Text>
            ) : entries.length ? (
              entries.map((entry: ContentEntry) =>
                entry.kind === "folder" ? (
                  <FolderRow
                    key={entry.id}
                    folder={{
                      id: entry.id,
                      name: entry.name,
                      category: entry.category ?? null,
                      parentId: entry.parentId ?? null,
                      canManage: true,
                      sharedBy: null,
                      createdAt: entry.createdAt,
                      author: entry.author
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/folder/[folderId]",
                        params: { folderId: entry.id }
                      })
                    }
                  />
                ) : (
                  <ItemRow
                    key={entry.id}
                    entry={entry}
                    onPress={() =>
                      router.push({
                        pathname: "/item/[itemId]",
                        params: { itemId: entry.id }
                      })
                    }
                  />
                )
              )
            ) : (
              <EmptyState
                title="Žádné položky"
                description="Tato složka je zatím prázdná. Nahrajte soubory, odkazy nebo vytvořte podsložku."
              />
            )}
          </View>
        </View>
      </ScrollView>

      <FilterSheet
        open={filterOpen}
        value={filters}
        onChange={setFilters}
        onApply={() => setFilterOpen(false)}
        onReset={() => setFilters(initialFilters)}
        onClose={() => setFilterOpen(false)}
        showItemFilters
      />

      <ConfirmationDialog
        open={deleteOpen}
        title="Smazat složku"
        description="Složka i její podsložky budou trvale odstraněny."
        confirmLabel="Smazat složku"
        onConfirm={() => {
          setDeleteOpen(false);
          deleteMutation.mutate();
        }}
        onClose={() => setDeleteOpen(false)}
      />
    </Screen>
  );
}
