import { api, setAccessToken } from "./http.js";

export async function login(email, password) {
  const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logout() {
  await api("/api/auth/logout", { method: "POST" });
  setAccessToken("");
}

export async function me() {
  return api("/api/auth/me");
}
