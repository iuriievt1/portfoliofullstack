import { Text, View } from "react-native";
import { PrimaryButton } from "@/src/components/primary-button";
import type { UploadQueueItem } from "@/src/types/api";

export function UploadQueueRow({
  item,
  onRetry
}: {
  item: UploadQueueItem;
  onRetry: () => void;
}) {
  return (
    <View className="rounded-[28px] border border-slate-200 bg-white px-4 py-4">
      <Text className="text-base font-semibold text-slate-950">{item.name}</Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <View className="h-2 rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
      </View>
      <Text className="mt-2 text-sm text-slate-500">
        {item.status === "done"
          ? "Soubor byl nahrán"
          : item.status === "error"
            ? item.error || "Nahrávání selhalo"
            : item.status === "uploading"
              ? `Nahrávání ${item.progress}%`
              : "Připraveno k nahrání"}
      </Text>
      {item.status === "error" ? (
        <View className="mt-3">
          <PrimaryButton title="Zkusit znovu" onPress={onRetry} tone="secondary" />
        </View>
      ) : null}
    </View>
  );
}
