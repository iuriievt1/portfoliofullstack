import { useLocalSearchParams } from "expo-router";

import { MoreScreen } from "@/screens/stack-screens";

export default function MoreRoute() {
  const params = useLocalSearchParams<{
    screen: string;
    sellerId?: string;
    productId?: string;
    orderId?: string;
  }>();

  return (
    <MoreScreen
      screen={params.screen}
      sellerId={params.sellerId}
      productId={params.productId}
      orderId={params.orderId}
    />
  );
}
