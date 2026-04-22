import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#0f172a",
        headerStyle: { backgroundColor: "#f8fafc" },
        contentStyle: { backgroundColor: "#f8fafc" }
      }}
    >
      <Stack.Screen name="index" options={{ title: "Složky", headerShown: false }} />
      <Stack.Screen name="folder/create" options={{ title: "Vytvořit složku", presentation: "modal" }} />
      <Stack.Screen name="folder/[folderId]" options={{ title: "Detail složky" }} />
      <Stack.Screen
        name="folder/[folderId]/rename"
        options={{ title: "Přejmenovat složku", presentation: "modal" }}
      />
      <Stack.Screen
        name="folder/[folderId]/upload"
        options={{ title: "Nahrát soubory", presentation: "modal" }}
      />
      <Stack.Screen
        name="folder/[folderId]/link"
        options={{ title: "Přidat odkaz", presentation: "modal" }}
      />
      <Stack.Screen name="item/[itemId]" options={{ title: "Detail položky" }} />
      <Stack.Screen name="profile" options={{ title: "Profil" }} />
    </Stack>
  );
}
