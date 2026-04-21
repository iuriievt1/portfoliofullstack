import { useLocalSearchParams } from "expo-router";

import { CatalogScreen } from "@/screens/tab-screens";

export default function CatalogRoute() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  return <CatalogScreen initialCategoryId={params.categoryId} />;
}
