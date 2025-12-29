import axios from "axios";

export const http = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" }
});

// Refresh-on-401 (cookie-based access token)
let refreshing = null;

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";

    if (status === 401 && !url.includes("/api/auth/refresh")) {
      if (!refreshing) {
        refreshing = http.post("/api/auth/refresh").finally(() => (refreshing = null));
      }
      try {
        await refreshing;
        return http.request(err.config);
      } catch {
        // fallthrough
      }
    }
    throw err;
  }
);
