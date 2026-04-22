import { Text, TextInput, TextInputProps, View } from "react-native";

type TextFieldProps = TextInputProps & {
  label: string;
  multiline?: boolean;
};

export function TextField({ label, multiline = false, ...props }: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-3xl border border-slate-200 bg-white px-4 text-base text-slate-950 ${
          multiline ? "min-h-[120px] py-4" : "h-14"
        }`}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}
