import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/src/components/screen";
import { SearchInput } from "@/src/components/search-input";
import { FilterSheet, type FilterState } from "@/src/components/filter-sheet";
import { FolderRow } from "@/src/components/folder-row";
import { EmptyState } from "@/src/components/empty-state";
import { SectionHeader } from "@/src/components/section-header";
import { useSession } from "@/src/providers/session-provider";
import { buildQuery } from "@/src/lib/utils";
import { queryKeys } from "@/src/lib/config";
import type { FolderRecord } from "@/src/types/api";
import { useDebouncedValue } from "@/src/hooks/use-debounced-value";

const initialFilters: FilterState = {
  sortBy: "name",
  order: "asc",
  author: "",
  type: "",
  dateFrom: "",
  dateTo: "",
  sizeMin: "",
  sizeMax: ""
};

export default function FolderOverviewScreen() {
  const { authorizedFetch, user } = useSession();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [sheetOpen, setSheetOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  const params = useMemo(
    () =>
      buildQuery({
        search: debouncedSearch,
        author: filters.author,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy: filters.sortBy,
        order: filters.order
      }),
    [debouncedSearch, filters.author, filters.dateFrom, filters.dateTo, filters.order, filters.sortBy]
  );

  const foldersQuery = useQuery({
    queryKey: queryKeys.folders(params),
    queryFn: async () => {
      const response = await authorizedFetch(`/api/folders${params}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Nepodařilo se načíst složky.");
      }

      return payload.folders as FolderRecord[];
    }
  });

  const visibleFolders = useMemo(() => {
    if (!foldersQuery.data) {
      return [];
    }

    if (debouncedSearch) {
      return foldersQuery.data;
    }

    return foldersQuery.data.filter((folder: FolderRecord) => folder.parentId === null);
  }, [debouncedSearch, foldersQuery.data]);

  return (
    <Screen padded={false}>
      <ScrollView
        className="flex-1 px-5"
        refreshControl={<RefreshControl refreshing={foldersQuery.isRefetching} onRefresh={foldersQuery.refetch} />}
      >
        <View className="pb-8 pt-4">
          <SectionHeader
            title="Hlavní přehled složek"
            subtitle={`Přihlášený uživatel: ${user?.name ?? ""}`}
          />

          <View className="gap-3">
            <SearchInput value={search} onChangeText={setSearch} placeholder="Hledat složky" />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => router.push("/folder/create")}
                className="flex-1 rounded-3xl bg-primary px-4 py-4"
              >
                <Text className="text-center text-base font-semibold text-white">Nová složka</Text>
              </Pressable>
              <Pressable
                onPress={() => setSheetOpen(true)}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-4"
              >
                <Text className="text-base font-semibold text-slate-900">Filtry</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/profile")}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-4"
              >
                <Text className="text-base font-semibold text-slate-900">Profil</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-6">
            {foldersQuery.isLoading ? (
              <Text className="text-sm text-slate-500">Načítání složek…</Text>
            ) : visibleFolders.length ? (
              visibleFolders.map((folder: FolderRecord) => (
                <FolderRow
                  key={folder.id}
                  folder={folder}
                  onPress={() =>
                    router.push({
                      pathname: "/folder/[folderId]",
                      params: { folderId: folder.id }
                    })
                  }
                />
              ))
            ) : (
              <EmptyState
                title="Žádné složky"
                description="Zatím zde nejsou žádné složky. Vytvořte první složku nebo upravte filtry."
              />
            )}
          </View>
        </View>
      </ScrollView>

      <FilterSheet
        open={sheetOpen}
        value={filters}
        onChange={setFilters}
        onApply={() => setSheetOpen(false)}
        onReset={() => setFilters(initialFilters)}
        onClose={() => setSheetOpen(false)}
        showItemFilters={false}
      />
    </Screen>
  );
}
