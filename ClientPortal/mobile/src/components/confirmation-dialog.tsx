import { Modal, Pressable, Text, View } from "react-native";
import { PrimaryButton } from "@/src/components/primary-button";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-5">
        <View className="w-full rounded-[32px] bg-white p-6">
          <Text className="text-xl font-semibold text-slate-950">{title}</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">{description}</Text>
          <View className="mt-6 gap-3">
            <PrimaryButton title={confirmLabel} onPress={onConfirm} tone="danger" />
            <Pressable onPress={onClose} className="items-center py-3">
              <Text className="text-sm font-medium text-slate-500">Zrušit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
