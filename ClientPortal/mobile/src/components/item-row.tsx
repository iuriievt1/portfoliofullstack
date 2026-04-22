import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { ContentEntry } from "@/src/types/api";
import { formatBytes, formatDate } from "@/src/lib/utils";

function getIcon(entry: ContentEntry) {
  if (entry.kind === "folder") {
    return "folder-open-outline";
  }

  if (entry.kind === "link") {
    return "link-outline";
  }

  return "document-outline";
}

export function ItemRow({
  entry,
  onPress
}: {
  entry: ContentEntry;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center rounded-[28px] border border-slate-200 bg-white px-4 py-4"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Ionicons name={getIcon(entry)} size={24} color="#0f172a" />
      </View>
      <View className="ml-4 flex-1 gap-1">
        <Text className="text-base font-semibold text-slate-950">{entry.name}</Text>
        <Text className="text-sm text-slate-500">
          {entry.author.name}
          {entry.kind === "file" ? ` · ${formatBytes(entry.sizeBytes)}` : ""}
          {entry.kind === "link" ? " · Odkaz" : ""}
        </Text>
        <Text className="text-xs text-slate-400">{formatDate(entry.createdAt)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </Pressable>
  );
}
