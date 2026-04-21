import { useLocalSearchParams } from "expo-router";

import { ProductDetailsScreen } from "@/screens/stack-screens";

export default function ProductDetailsRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  return <ProductDetailsScreen productId={params.id} />;
}
