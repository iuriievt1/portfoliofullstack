import { apiUrl } from "@/src/lib/config";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatBytes(value?: string | number | null) {
  if (value == null) {
    return "—";
  }

  const size = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(size) || size <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const amount = size / 1024 ** index;

  return `${amount.toFixed(amount >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function buildQuery(params: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim().length > 0) {
      searchParams.set(key, String(value));
    }
  });

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export function buildAbsoluteUrl(pathname: string) {
  if (/^https?:\/\//.test(pathname)) {
    return pathname;
  }

  return `${pathname.startsWith("/") ? apiUrl : `${apiUrl}/`}${pathname.replace(/^\/+/, "")}`;
}
