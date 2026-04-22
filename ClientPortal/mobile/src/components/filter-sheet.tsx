import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { PrimaryButton } from "@/src/components/primary-button";
import { TextField } from "@/src/components/text-field";

export type FilterState = {
  sortBy: "name" | "createdAt" | "newest" | "oldest" | "type" | "size";
  order: "asc" | "desc";
  author: string;
  type: "" | "file" | "link";
  dateFrom: string;
  dateTo: string;
  sizeMin: string;
  sizeMax: string;
};

const sortOptions: Array<{ value: FilterState["sortBy"]; label: string }> = [
  { value: "name", label: "Abecedně" },
  { value: "newest", label: "Nejnovější" },
  { value: "oldest", label: "Nejstarší" },
  { value: "type", label: "Typ" },
  { value: "size", label: "Velikost" }
];

export function FilterSheet({
  open,
  value,
  onChange,
  onApply,
  onReset,
  onClose,
  showItemFilters
}: {
  open: boolean;
  value: FilterState;
  onChange: (next: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  showItemFilters: boolean;
}) {
  const setField = <K extends keyof FilterState>(key: K, next: FilterState[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <Modal transparent visible={open} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="max-h-[88%] rounded-t-[32px] bg-slate-50 px-5 pb-10 pt-5">
          <View className="mb-5 h-1.5 w-16 self-center rounded-full bg-slate-300" />
          <ScrollView contentContainerStyle={{ gap: 14 }}>
            <Text className="text-xl font-semibold text-slate-950">Filtry a řazení</Text>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">Řazení</Text>
              <View className="flex-row flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setField("sortBy", option.value)}
                    className={`rounded-full px-4 py-2 ${
                      value.sortBy === option.value ? "bg-primary" : "bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        value.sortBy === option.value ? "text-white" : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextField
              label="Autor"
              value={value.author}
              onChangeText={(next: string) => setField("author", next)}
              placeholder="Filtrovat podle autora"
            />
            <TextField
              label="Datum od (YYYY-MM-DD)"
              value={value.dateFrom}
              onChangeText={(next: string) => setField("dateFrom", next)}
              placeholder="2026-04-21"
            />
            <TextField
              label="Datum do (YYYY-MM-DD)"
              value={value.dateTo}
              onChangeText={(next: string) => setField("dateTo", next)}
              placeholder="2026-04-21"
            />

            {showItemFilters ? (
              <>
                <TextField
                  label="Velikost od (B)"
                  value={value.sizeMin}
                  onChangeText={(next: string) => setField("sizeMin", next)}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <TextField
                  label="Velikost do (B)"
                  value={value.sizeMax}
                  onChangeText={(next: string) => setField("sizeMax", next)}
                  keyboardType="numeric"
                  placeholder="5000000"
                />
                <View>
                  <Text className="mb-2 text-sm font-medium text-slate-700">Typ položky</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "", label: "Vše" },
                      { value: "file", label: "Soubory" },
                      { value: "link", label: "Odkazy" }
                    ].map((option) => (
                      <Pressable
                        key={option.value || "all"}
                        onPress={() => setField("type", option.value as FilterState["type"])}
                        className={`rounded-full px-4 py-2 ${
                          value.type === option.value ? "bg-primary" : "bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            value.type === option.value ? "text-white" : "text-slate-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>

          <View className="mt-5 gap-3">
            <PrimaryButton title="Použít" onPress={onApply} />
            <PrimaryButton title="Resetovat" onPress={onReset} tone="secondary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
