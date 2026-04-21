import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { appConfig } from "@/config";

const LOCALE_STORAGE_KEY = "velora.locale";

const dictionaries = {
  cs: {
    common: {
      home: "Domů",
      catalog: "Kategorie",
      cart: "Košík",
      orders: "Objednávky",
      profile: "Profil",
      searchPlaceholder: "Hledat produkty, značky a prodejce",
      favorites: "Oblíbené",
      checkout: "Pokladna",
      support: "Podpora",
      legal: "Právní informace",
      settings: "Nastavení",
      notifications: "Oznámení",
      addresses: "Adresy",
      reviews: "Recenze",
      returns: "Vrácení",
      seller: "Prodejce",
      save: "Uložit",
      cancel: "Zrušit",
      retry: "Zkusit znovu",
      loading: "Načítání",
      empty: "Zatím nic nevidíme",
      error: "Něco se nepovedlo",
      continue: "Pokračovat",
      placeOrder: "Dokončit objednávku",
      pickupPoint: "Výdejní místo",
      paymentMethod: "Způsob platby",
      deliveryMethod: "Doručení",
      language: "Jazyk",
      logout: "Odhlásit se",
      login: "Přihlášení",
      guest: "Pokračovat jako host",
      change: "Změnit",
      buyNow: "Koupit hned",
      addToCart: "Do košíku",
      inCart: "V košíku",
      continueShopping: "Pokračovat v nákupu",
      comingSoon: "Již brzy",
      unavailable: "Brzy spustíme"
    },
    entry: {
      title: "Vyberte zemi",
      subtitle: "Začínáme v Česku. Další země přidáme v nejbližší době.",
      availableCountry: "Dostupná země",
      comingSoonCountries: "V nejbližší době",
      citySelector: "Město",
      cityHint: "Po výběru Česka nastavíme automaticky Prahu, ale můžete ji kdykoliv změnit.",
      chooseLanguage: "Jazyk aplikace"
    },
    home: {
      locationLabel: "Město",
      promoLabel: "Marketplace pro každodenní nákupy",
      promoTitle: "V Praze nakoupíte rychleji a přehledněji",
      promoSubtitle: "Velké karty, jasné ceny, výrazné akce a pohodlné dokončení objednávky.",
      bestsellers: "Bestsellery",
      fastPickup: "Vyzvednutí dnes",
      deals: "Dobré ceny",
      discover: "Objevte",
      citySheetTitle: "Vyberte město",
      openCatalog: "Prohlédnout kategorii",
      heroCta: "Nakupovat"
    },
    catalog: {
      title: "Co chcete nakoupit?",
      subtitle: "Marketingové vstupy i produktové kategorie v jednom čistém přehledu.",
      products: "Produkty",
      resetFilters: "Vymazat filtry",
      filters: "Filtry",
      searchInCatalog: "Hledat v katalogu",
      nothingFound: "Nic jsme nenašli",
      nothingFoundSubtitle: "Zkuste jiný dotaz nebo resetujte filtry."
    },
    cartScreen: {
      title: "Košík",
      emptyTitle: "Košík je zatím prázdný",
      emptySubtitle: "Přidejte si produkty a pak pokračujte do objednávky.",
      checkoutCta: "Pokračovat k objednávce",
      orderNote: "Objednávku dokončíte po registraci nebo přihlášení.",
      deliverySoon: "Doručení za 1-2 dny",
      pickupToday: "Vyzvednutí ještě dnes",
      saveForLater: "Uložit na později",
      remove: "Odstranit",
      selectAddress: "Vyberte adresu nebo výdejní místo"
    },
    auth: {
      title: "Dokončete registraci",
      subtitle: "Pro objednávku potřebujeme jméno, příjmení, telefon a e-mail. Prohlížení a přidávání do košíku zůstává bez účtu.",
      firstName: "Jméno",
      lastName: "Příjmení",
      email: "E-mail",
      phone: "Telefon",
      continueWithEmail: "Pokračovat",
      continueWithApple: "Apple Sign-In připraveno",
      continueWithGoogle: "Google Sign-In připraveno",
      phoneOtp: "Phone + OTP připraveno",
      guestHint: "Jazyk mění aplikaci okamžitě, restart není potřeba.",
      legal: "Pokračováním souhlasíte s podmínkami a zásadami ochrany osobních údajů."
    },
    checkout: {
      contact: "Kontaktní údaje",
      summary: "Souhrn objednávky",
      selectedPickup: "Vybrané místo",
      selectedPayment: "Platba",
      placeOrderSuccess: "Objednávka byla vytvořena",
      priceChanged: "Cena byla aktualizována před dokončením objednávky.",
      title: "Dokončení objednávky",
      requireAccount: "Pro dokončení objednávky se přihlaste nebo vytvořte účet.",
      deliveryStep: "Doručení",
      paymentStep: "Platba",
      summaryStep: "Souhrn"
    },
    profileScreen: {
      signInTitle: "Přihlaste se ke svému účtu",
      signInSubtitle: "Po přihlášení uvidíte slevy, objednávky, adresy i uložené položky.",
      language: "Jazyk aplikace",
      country: "Země",
      city: "Město",
      account: "Můj účet",
      services: "Služby"
    }
  },
  en: {
    common: {
      home: "Home",
      catalog: "Categories",
      cart: "Cart",
      orders: "Orders",
      profile: "Profile",
      searchPlaceholder: "Search products, brands and sellers",
      favorites: "Favorites",
      checkout: "Checkout",
      support: "Support",
      legal: "Legal",
      settings: "Settings",
      notifications: "Notifications",
      addresses: "Addresses",
      reviews: "Reviews",
      returns: "Returns",
      seller: "Seller",
      save: "Save",
      cancel: "Cancel",
      retry: "Retry",
      loading: "Loading",
      empty: "Nothing here yet",
      error: "Something went wrong",
      continue: "Continue",
      placeOrder: "Place order",
      pickupPoint: "Pickup point",
      paymentMethod: "Payment method",
      deliveryMethod: "Delivery",
      language: "Language",
      logout: "Log out",
      login: "Sign in",
      guest: "Continue as guest",
      change: "Change",
      buyNow: "Buy now",
      addToCart: "Add to cart",
      inCart: "In cart",
      continueShopping: "Continue shopping",
      comingSoon: "Coming soon",
      unavailable: "Launching soon"
    },
    entry: {
      title: "Choose your country",
      subtitle: "We are launching in Czechia first. More countries are coming very soon.",
      availableCountry: "Available now",
      comingSoonCountries: "Coming soon",
      citySelector: "City",
      cityHint: "Once you choose Czechia we default to Prague, but you can switch cities anytime.",
      chooseLanguage: "App language"
    },
    home: {
      locationLabel: "City",
      promoLabel: "Everyday marketplace",
      promoTitle: "Shop Prague with a cleaner and faster retail flow",
      promoSubtitle: "Big cards, clear prices, strong deals, and a smoother checkout path.",
      bestsellers: "Bestsellers",
      fastPickup: "Pickup today",
      deals: "Good deals",
      discover: "Discover",
      citySheetTitle: "Choose a city",
      openCatalog: "Open category",
      heroCta: "Shop now"
    },
    catalog: {
      title: "What do you want to shop?",
      subtitle: "Marketing entry points and product categories in one cleaner view.",
      products: "Products",
      resetFilters: "Reset filters",
      filters: "Filters",
      searchInCatalog: "Search catalog",
      nothingFound: "Nothing found",
      nothingFoundSubtitle: "Try a different query or reset the filters."
    },
    cartScreen: {
      title: "Cart",
      emptyTitle: "Your cart is empty",
      emptySubtitle: "Add products first and then continue to checkout.",
      checkoutCta: "Continue to checkout",
      orderNote: "You will be asked to register before placing the order.",
      deliverySoon: "Delivery in 1-2 days",
      pickupToday: "Pickup today",
      saveForLater: "Save for later",
      remove: "Remove",
      selectAddress: "Choose address or pickup point"
    },
    auth: {
      title: "Complete your registration",
      subtitle: "To place an order we need your first name, last name, phone number, and email. Browsing and adding to cart stays open to guests.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      continueWithEmail: "Continue",
      continueWithApple: "Apple Sign-In ready",
      continueWithGoogle: "Google Sign-In ready",
      phoneOtp: "Phone + OTP ready",
      guestHint: "Language switches live, no app restart needed.",
      legal: "By continuing you agree to the Terms and Privacy Policy."
    },
    checkout: {
      contact: "Contact details",
      summary: "Order summary",
      selectedPickup: "Selected pickup point",
      selectedPayment: "Payment",
      placeOrderSuccess: "Order created successfully",
      priceChanged: "Price changed before checkout completion.",
      title: "Checkout",
      requireAccount: "Sign in or register to complete your order.",
      deliveryStep: "Delivery",
      paymentStep: "Payment",
      summaryStep: "Summary"
    },
    profileScreen: {
      signInTitle: "Sign in to your account",
      signInSubtitle: "Once signed in you will see discounts, orders, addresses, and saved items.",
      language: "App language",
      country: "Country",
      city: "City",
      account: "My account",
      services: "Services"
    }
  }
} as const;

export type Locale = keyof typeof dictionaries;
type Namespace = keyof (typeof dictionaries)["cs"];

type I18nContextValue = {
  locale: Locale;
  setLocale: (value: Locale) => void;
  t: (namespace: Namespace, key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const getInitialLocale = (): Locale => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  return appConfig.supportedLocales.includes(deviceLocale as Locale)
    ? (deviceLocale as Locale)
    : appConfig.defaultLocale;
};

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    void (async () => {
      const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (storedLocale === "cs" || storedLocale === "en") {
        setLocaleState(storedLocale);
      }
    })();
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    void AsyncStorage.setItem(LOCALE_STORAGE_KEY, value);
  };

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (namespace, key) => {
        const dictionary = dictionaries[locale] as Record<string, Record<string, string>>;
        return dictionary[namespace]?.[key] ?? key;
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
