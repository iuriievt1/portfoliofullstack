import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api/auth.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then((r) => setUser(r.user)).catch(() => {}).finally(() => setReady(true));
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    async login(email, password) {
      const r = await api.login({ email, password });
      setUser(r.user);
      return r.user;
    },
    async register(email, password, name) {
      await api.register({ email, password, name });
      const r = await api.login({ email, password });
      setUser(r.user);
      return r.user;
    },
    async logout() {
      await api.logout();
      setUser(null);
    }
  }), [user, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
