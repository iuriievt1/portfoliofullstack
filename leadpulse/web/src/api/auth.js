import { http } from "./http.js";

export async function register({ email, password, name }) {
  const { data } = await http.post("/api/auth/register", { email, password, name });
  return data;
}

export async function login({ email, password }) {
  const { data } = await http.post("/api/auth/login", { email, password });
  return data;
}

export async function me() {
  const { data } = await http.get("/api/auth/me");
  return data;
}

export async function logout() {
  const { data } = await http.post("/api/auth/logout");
  return data;
}
