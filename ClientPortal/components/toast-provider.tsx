"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

type ToastTone = "success" | "error";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  function push(message: string, tone: ToastTone) {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, tone }]);

    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, 3200);

    timers.current.set(id, timer);
  }

  return (
    <ToastContext.Provider
      value={{
        success: (message) => push(message, "success"),
        error: (message) => push(message, "error")
      }}
    >
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[280px] rounded-2xl border px-4 py-3 text-sm font-medium shadow-panel ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-rose-200 bg-rose-50 text-rose-900"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast musí být použito uvnitř ToastProvider.");
  }

  return context;
}
