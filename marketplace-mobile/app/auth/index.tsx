import { useLocalSearchParams } from "expo-router";

import { AuthScreen } from "@/screens/stack-screens";

export default function AuthRoute() {
  const params = useLocalSearchParams<{ redirectTo?: string }>();
  return <AuthScreen redirectTo={params.redirectTo} />;
}
