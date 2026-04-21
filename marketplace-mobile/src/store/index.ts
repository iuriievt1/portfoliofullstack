import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { appConfig } from "@/config";
import { analytics, sessionStorage } from "@/services/platform";
import type {
  CartItem,
  DeliveryMethod,
  PaymentMethodType,
  PickupPoint,
  Product,
  Session,
  SupportedCity,
  SupportedCountry,
  User
} from "@/types/domain";

const APP_PREFERENCES_KEY = "velora.preferences";

type AuthState = {
  session: Session | null;
  hydrated: boolean;
  restoreSession: () => Promise<void>;
  login: (session: Session) => Promise<void>;
  logout: () => Promise<void>;
};

type CommerceState = {
  cartItems: CartItem[];
  favoriteIds: string[];
  recentSearches: string[];
  selectedPickupPoint: PickupPoint | null;
  selectedDeliveryMethod: DeliveryMethod;
  selectedPaymentMethod: PaymentMethodType;
  draftContact: Pick<User, "firstName" | "lastName" | "email" | "phone"> | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleFavorite: (productId: string) => void;
  rememberSearch: (value: string) => void;
  selectPickupPoint: (point: PickupPoint) => void;
  selectDeliveryMethod: (method: DeliveryMethod) => void;
  selectPaymentMethod: (method: PaymentMethodType) => void;
  setDraftContact: (contact: CommerceState["draftContact"]) => void;
  clearCheckoutState: () => void;
  clearCart: () => void;
};

type AppPreferencesState = {
  hydrated: boolean;
  selectedCountry: SupportedCountry | null;
  selectedCity: SupportedCity;
  restorePreferences: () => Promise<void>;
  selectCountry: (country: SupportedCountry) => Promise<void>;
  selectCity: (city: SupportedCity) => Promise<void>;
};

type StoredPreferences = Pick<AppPreferencesState, "selectedCountry" | "selectedCity">;

const persistPreferences = async (value: StoredPreferences) => {
  await AsyncStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(value));
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  async restoreSession() {
    const session = await sessionStorage.load();
    set({ session, hydrated: true });
  },
  async login(session) {
    await sessionStorage.save(session);
    set({ session });
    analytics.track("login", { userId: session.user.id });
  },
  async logout() {
    await sessionStorage.clear();
    set({ session: null });
  }
}));

export const useCommerceStore = create<CommerceState>((set, get) => ({
  cartItems: [],
  favoriteIds: [],
  recentSearches: [],
  selectedPickupPoint: null,
  selectedDeliveryMethod: "pickup_point",
  selectedPaymentMethod: "card",
  draftContact: null,
  addToCart(product) {
    const existingItem = get().cartItems.find((item) => item.productId === product.id);

    if (existingItem) {
      set({
        cartItems: get().cartItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      });
    } else {
      set({
        cartItems: [
          ...get().cartItems,
          {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            quantity: 1,
            sellerId: product.sellerId
          }
        ]
      });
    }

    analytics.track("add_to_cart", { productId: product.id });
  },
  removeFromCart(productId) {
    set({
      cartItems: get().cartItems.filter((item) => item.productId !== productId)
    });
  },
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set({
      cartItems: get().cartItems.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    });
  },
  toggleFavorite(productId) {
    const exists = get().favoriteIds.includes(productId);
    set({
      favoriteIds: exists
        ? get().favoriteIds.filter((id) => id !== productId)
        : [...get().favoriteIds, productId]
    });
    analytics.track("add_to_favorites", { productId, state: exists ? "removed" : "added" });
  },
  rememberSearch(value) {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }

    set({
      recentSearches: [normalized, ...get().recentSearches.filter((item) => item !== normalized)].slice(0, 5)
    });
  },
  selectPickupPoint(point) {
    set({ selectedPickupPoint: point });
    analytics.track("select_pickup_point", { pickupPointId: point.id });
  },
  selectDeliveryMethod(method) {
    set({ selectedDeliveryMethod: method });
  },
  selectPaymentMethod(method) {
    set({ selectedPaymentMethod: method });
  },
  setDraftContact(contact) {
    set({ draftContact: contact });
  },
  clearCheckoutState() {
    set({
      selectedPickupPoint: null,
      selectedDeliveryMethod: "pickup_point",
      selectedPaymentMethod: "card",
      draftContact: null
    });
  },
  clearCart() {
    set({ cartItems: [] });
  }
}));

export const useAppStore = create<AppPreferencesState>((set, get) => ({
  hydrated: false,
  selectedCountry: null,
  selectedCity: appConfig.defaultCity,
  async restorePreferences() {
    try {
      const rawValue = await AsyncStorage.getItem(APP_PREFERENCES_KEY);
      if (!rawValue) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(rawValue) as Partial<StoredPreferences>;
      set({
        hydrated: true,
        selectedCountry: parsed.selectedCountry === "cz" ? parsed.selectedCountry : null,
        selectedCity:
          parsed.selectedCity === "brno" ||
          parsed.selectedCity === "plzen" ||
          parsed.selectedCity === "karlovy-vary"
            ? parsed.selectedCity
            : appConfig.defaultCity
      });
    } catch {
      set({ hydrated: true });
    }
  },
  async selectCountry(country) {
    const nextValue: StoredPreferences = {
      selectedCountry: country,
      selectedCity: get().selectedCity ?? appConfig.defaultCity
    };

    set(nextValue);
    await persistPreferences(nextValue);
  },
  async selectCity(city) {
    const nextValue: StoredPreferences = {
      selectedCountry: get().selectedCountry ?? appConfig.defaultCountry,
      selectedCity: city
    };

    set(nextValue);
    await persistPreferences(nextValue);
  }
}));
