const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4010";

let accessToken = localStorage.getItem("cl_access") || "";

export function setAccessToken(t) {
  accessToken = t || "";
  if (accessToken) localStorage.setItem("cl_access", accessToken);
  else localStorage.removeItem("cl_access");
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include"
  });
  if (!res.ok) throw new Error("refresh failed");
  const data = await res.json();
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function api(path, { method = "GET", body, headers = {}, retry = true } = {}) {
  const doFetch = async () => {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (res.status === 401 && retry) {
      // try refresh once
      await refreshAccessToken();
      return api(path, { method, body, headers, retry: false });
    }

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        msg = j.error || msg;
      } catch {}
      throw new Error(msg);
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
  };

  return doFetch();
}

export { API_URL };
