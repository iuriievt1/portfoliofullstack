import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error">("success");
  const opacity = useRef(new Animated.Value(0)).current;

  const show = (nextTone: "success" | "error", nextMessage: string) => {
    setTone(nextTone);
    setMessage(nextMessage);

    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true })
    ]).start(() => {
      setMessage(null);
    });
  };

  const value = useMemo(
    () => ({
      success: (nextMessage: string) => show("success", nextMessage),
      error: (nextMessage: string) => show("error", nextMessage)
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          style={{ opacity }}
          className={`absolute left-4 right-4 top-16 rounded-3xl px-4 py-3 ${
            tone === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <Text className="text-center text-sm font-semibold text-white">{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast musí být uvnitř ToastProvider.");
  }

  return context;
}
