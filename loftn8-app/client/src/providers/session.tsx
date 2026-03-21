"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { storage } from "@/lib/storage";
import { api } from "@/lib/api";

type SessionState = {
  tableCode: string | null;
  setTableCode: (code: string | null) => void;
  sessionReady: boolean;
  sessionError: string | null;
  restoreSession: () => Promise<void>;
};

const Ctx = createContext<SessionState | null>(null);

const TABLE_KEY = "tableCode";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [tableCode, _setTableCode] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const restoreInFlightRef = useRef(false);

  const setTableCode = (code: string | null) => {
    _setTableCode(code);
    if (code) storage.set(TABLE_KEY, code);
    else storage.del(TABLE_KEY);
  };

  const restoreSession = async () => {
    if (restoreInFlightRef.current) return;
    restoreInFlightRef.current = true;

    try {
      setSessionError(null);

      const savedCode = storage.get(TABLE_KEY, null as string | null);
      if (savedCode && savedCode !== tableCode) {
        _setTableCode(savedCode);
      }

      // 1) пробуем использовать существующую guest session
      try {
        await api("/guest/me");
        setSessionReady(true);
        return;
      } catch {
        // ignore
      }

      // 2) если есть tableCode — восстанавливаем session молча
      const code = savedCode ?? tableCode;
      if (code) {
        try {
          await api("/guest/session", {
            method: "POST",
            body: JSON.stringify({ tableCode: code }),
          });
          setSessionReady(true);
          return;
        } catch (e: any) {
          storage.del(TABLE_KEY);
          _setTableCode(null);
          setSessionError(e?.message ?? "Failed to restore table session");
        }
      } else {
        setSessionError("No table selected");
      }

      setSessionReady(false);
    } finally {
      restoreInFlightRef.current = false;
    }
  };

  useEffect(() => {
    const savedCode = storage.get(TABLE_KEY, null as string | null);
    if (savedCode) {
      _setTableCode(savedCode);
    }
    void restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      tableCode,
      setTableCode,
      sessionReady,
      sessionError,
      restoreSession,
    }),
    [tableCode, sessionReady, sessionError]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}