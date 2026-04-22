import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { FolderRecord, FolderSummary } from "@/src/types/api";
import { formatDate } from "@/src/lib/utils";

type FolderLike = FolderRecord | FolderSummary;

export function FolderRow({
  folder,
  onPress
}: {
  folder: FolderLike;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-[28px] border border-slate-200 bg-white px-4 py-4"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
        <Ionicons name="folder-open-outline" size={24} color="#0f766e" />
      </View>
      <View className="ml-4 flex-1 gap-1">
        <Text className="text-base font-semibold text-slate-950">{folder.name}</Text>
        <Text className="text-sm text-slate-500">
          {folder.category || "Bez kategorie"} · {folder.author.name}
        </Text>
        <Text className="text-xs text-slate-400">{formatDate(folder.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </Pressable>
  );
}
