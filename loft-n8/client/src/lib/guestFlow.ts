"use client";

const ANON_BYPASS_AUTH_ONCE_KEY = "loftn8AnonBypassAuthOnce";

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function markAnonBypassAuthOnce() {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(ANON_BYPASS_AUTH_ONCE_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

export function consumeAnonBypassAuthOnce() {
  if (!canUseSessionStorage()) return false;

  try {
    if (window.sessionStorage.getItem(ANON_BYPASS_AUTH_ONCE_KEY) !== "1") {
      return false;
    }

    window.sessionStorage.removeItem(ANON_BYPASS_AUTH_ONCE_KEY);
    return true;
  } catch {
    return false;
  }
}
