import { useLocalSearchParams } from "expo-router";

import { OrderDetailsScreen } from "@/screens/stack-screens";

export default function OrderDetailsRoute() {
  const params = useLocalSearchParams<{ id: string }>();
  return <OrderDetailsScreen orderId={params.id} />;
}
