import { ActivityIndicator, Pressable, Text } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "danger" | "secondary";
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  tone = "primary"
}: PrimaryButtonProps) {
  const palette =
    tone === "danger"
      ? "bg-rose-600"
      : tone === "secondary"
        ? "bg-slate-900"
        : "bg-primary";

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-14 items-center justify-center rounded-3xl ${palette} ${
        disabled || loading ? "opacity-60" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-base font-semibold text-white">{title}</Text>
      )}
    </Pressable>
  );
}
