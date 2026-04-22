import { Ionicons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Hledat"
}: SearchInputProps) {
  return (
    <View className="h-14 flex-row items-center rounded-3xl border border-slate-200 bg-white px-4">
      <Ionicons name="search" size={18} color="#64748b" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="ml-3 flex-1 text-base text-slate-950"
      />
    </View>
  );
}
