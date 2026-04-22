"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  clearStoredAuthState,
  readStoredAuthState,
  writeStoredAuthState
} from "@/src/lib/auth-storage";
import { apiUrl } from "@/src/lib/config";
import type { SessionUser, StoredAuthState, TokensPayload } from "@/src/types/api";

type SignInInput = {
  email: string;
  password: string;
};

type SessionContextValue = {
  user: SessionUser | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => Promise<void>;
  authorizedFetch: (pathname: string, init?: RequestInit, retry?: boolean) => Promise<Response>;
  getAccessToken: () => Promise<string | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function buildStoredState(payload: TokensPayload): StoredAuthState {
  return {
    ...payload,
    accessTokenExpiresAt: Date.now() + payload.expiresIn * 1000
  };
}

async function jsonOrThrow<T>(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? "Požadavek se nezdařil.");
  }

  return payload as T;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredAuthState | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const refreshPromiseRef = useRef<Promise<StoredAuthState | null> | null>(null);

  const persistState = useCallback(async (next: StoredAuthState | null) => {
    setState(next);

    if (next) {
      await writeStoredAuthState(next);
    } else {
      await clearStoredAuthState();
    }
  }, []);

  const refreshSession = useCallback(async (refreshTokenOverride?: string | null) => {
    const refreshToken = refreshTokenOverride ?? state?.refreshToken;

    if (!refreshToken) {
      await persistState(null);
      return null;
    }

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        const response = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            refreshToken
          })
        });

        if (!response.ok) {
          await persistState(null);
          return null;
        }

        const payload = (await response.json()) as TokensPayload;
        const next = buildStoredState(payload);
        await persistState(next);
        return next;
      })().finally(() => {
        refreshPromiseRef.current = null;
      });
    }

    return refreshPromiseRef.current;
  }, [persistState, state?.refreshToken]);

  const getAccessToken = useCallback(async () => {
    if (!state) {
      return null;
    }

    if (Date.now() < state.accessTokenExpiresAt - 15_000) {
      return state.accessToken;
    }

    const refreshed = await refreshSession();
    return refreshed?.accessToken ?? null;
  }, [refreshSession, state]);

  const authorizedFetch = useCallback(
    async (pathname: string, init: RequestInit = {}, retry = true) => {
      const accessToken = await getAccessToken();
      const headers = new Headers(init.headers);

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const response = await fetch(`${apiUrl}${pathname}`, {
        ...init,
        headers
      });

      if (response.status === 401 && retry && state?.refreshToken) {
        const refreshed = await refreshSession();

        if (!refreshed?.accessToken) {
          throw new Error("Přihlášení vypršelo.");
        }

        headers.set("Authorization", `Bearer ${refreshed.accessToken}`);

        return fetch(`${apiUrl}${pathname}`, {
          ...init,
          headers
        });
      }

      return response;
    },
    [getAccessToken, refreshSession, state?.refreshToken]
  );

  const bootstrap = useCallback(async () => {
    const stored = await readStoredAuthState();
    if (!stored) {
      setIsBootstrapping(false);
      return;
    }

    setState(stored);

    const response = await fetch(`${apiUrl}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${stored.accessToken}`
      }
    });

    if (response.ok) {
      const payload = (await response.json()) as { user: SessionUser };
      setState((current: StoredAuthState | null) => (current ? { ...current, user: payload.user } : current));
      setIsBootstrapping(false);
      return;
    }

    const refreshed = await refreshSession(stored.refreshToken);
    if (!refreshed) {
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(false);
  }, [refreshSession]);

  useEffect(() => {
    void bootstrap().catch((error) => {
      console.error(error);
      Alert.alert("Chyba", "Nepodařilo se načíst relaci.");
      void persistState(null);
      setIsBootstrapping(false);
    });
  }, [bootstrap, persistState]);

  const signIn = useCallback(
    async ({ email, password }: SignInInput) => {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          deviceName: "Expo Mobile"
        })
      });

      const payload = await jsonOrThrow<TokensPayload>(response);
      await persistState(buildStoredState(payload));
    },
    [persistState]
  );

  const signOut = useCallback(async () => {
    try {
      if (state?.refreshToken) {
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            refreshToken: state.refreshToken
          })
        });
      }
    } finally {
      await persistState(null);
    }
  }, [persistState, state?.refreshToken]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: state?.user ?? null,
      isBootstrapping,
      isAuthenticated: Boolean(state?.accessToken),
      signIn,
      signOut,
      authorizedFetch,
      getAccessToken
    }),
    [authorizedFetch, getAccessToken, isBootstrapping, signIn, signOut, state?.accessToken, state?.user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession musí být uvnitř SessionProvider.");
  }

  return context;
}
