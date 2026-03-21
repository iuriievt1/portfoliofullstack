import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string | { toString(): string },
  currency = process.env.DEFAULT_CURRENCY || "USD",
  locale = process.env.DEFAULT_LOCALE || "en-US"
) {
  const value = Number(typeof amount === "object" && amount !== null ? amount.toString() : amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

export function absoluteUrl(path = "/") {
  const base = process.env.APP_URL || "http://localhost:3000";
  return new URL(path, base).toString();
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-")
    .replace(/-+/g, "-");
}

export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function serializeForClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
