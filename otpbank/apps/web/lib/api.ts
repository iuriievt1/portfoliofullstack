"use client";

function readCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1];
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const csrf = readCookie("otpbank_csrf");
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
      ...(init?.headers ?? {})
    }
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }
  return payload.data as T;
}
