import { clsx } from "clsx";

export function cn(...values: Array<string | boolean | null | undefined>) {
  return clsx(values);
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem("vybe_token");
}

export function setAuthSession(token: string, user: string) {
  window.localStorage.setItem("vybe_token", token);
  window.localStorage.setItem("vybe_user", user);
}

export function clearAuthSession() {
  window.localStorage.removeItem("vybe_token");
  window.localStorage.removeItem("vybe_user");
}

