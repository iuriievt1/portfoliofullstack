import * as SecureStore from "expo-secure-store";
import type { StoredAuthState } from "@/src/types/api";

const STORAGE_KEY = "portal_mobile_auth";

export async function readStoredAuthState() {
  const value = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuthState;
  } catch {
    return null;
  }
}

export async function writeStoredAuthState(state: StoredAuthState) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(state));
}

export async function clearStoredAuthState() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}
