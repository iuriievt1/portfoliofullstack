import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View className="mt-10 items-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10">
      <Ionicons name="albums-outline" size={32} color="#64748b" />
      <Text className="mt-4 text-lg font-semibold text-slate-950">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">{description}</Text>
    </View>
  );
}
