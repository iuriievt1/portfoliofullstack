export type LocalizedText = {
  cs: string;
  en: string;
};

export type CountryOption = {
  id: "cz" | "de" | "pl" | "hr" | "ee";
  flag: string;
  enabled: boolean;
  label: LocalizedText;
  note?: LocalizedText;
};

export type CityOption = {
  id: "praha" | "brno" | "plzen" | "karlovy-vary";
  countryId: "cz";
  label: LocalizedText;
  shortLabel: LocalizedText;
};

export type DiscoveryTile = {
  id: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  accent: string;
  textColor: string;
  icon: string;
  categoryId?: string;
  saleOnly?: boolean;
  comingSoon?: boolean;
  featured?: boolean;
};

export const countryOptions: CountryOption[] = [
  {
    id: "cz",
    flag: "🇨🇿",
    enabled: true,
    label: {
      cs: "Česko",
      en: "Czechia"
    },
    note: {
      cs: "Dostupné nyní",
      en: "Available now"
    }
  },
  {
    id: "de",
    flag: "🇩🇪",
    enabled: false,
    label: {
      cs: "Německo",
      en: "Germany"
    }
  },
  {
    id: "pl",
    flag: "🇵🇱",
    enabled: false,
    label: {
      cs: "Polsko",
      en: "Poland"
    }
  },
  {
    id: "hr",
    flag: "🇭🇷",
    enabled: false,
    label: {
      cs: "Chorvatsko",
      en: "Croatia"
    }
  },
  {
    id: "ee",
    flag: "🇪🇪",
    enabled: false,
    label: {
      cs: "Estonsko",
      en: "Estonia"
    }
  }
];

export const cityOptions: CityOption[] = [
  {
    id: "praha",
    countryId: "cz",
    label: {
      cs: "Praha",
      en: "Prague"
    },
    shortLabel: {
      cs: "Praha",
      en: "Prague"
    }
  },
  {
    id: "brno",
    countryId: "cz",
    label: {
      cs: "Brno",
      en: "Brno"
    },
    shortLabel: {
      cs: "Brno",
      en: "Brno"
    }
  },
  {
    id: "plzen",
    countryId: "cz",
    label: {
      cs: "Plzeň",
      en: "Pilsen"
    },
    shortLabel: {
      cs: "Plzeň",
      en: "Pilsen"
    }
  },
  {
    id: "karlovy-vary",
    countryId: "cz",
    label: {
      cs: "Karlovy Vary",
      en: "Karlovy Vary"
    },
    shortLabel: {
      cs: "Karlovy Vary",
      en: "Karlovy Vary"
    }
  }
];

export const discoveryTiles: DiscoveryTile[] = [
  {
    id: "brands",
    title: { cs: "Značky", en: "Brands" },
    subtitle: { cs: "Jen vybrané", en: "Selected only" },
    accent: "#111111",
    textColor: "#FFFFFF",
    icon: "sparkles-outline",
    featured: true
  },
  {
    id: "travel",
    title: { cs: "Cestování", en: "Travel" },
    accent: "#FF5A3D",
    textColor: "#FFFFFF",
    icon: "airplane-outline",
    comingSoon: true,
    featured: true
  },
  {
    id: "express",
    title: { cs: "Expres", en: "Express" },
    subtitle: { cs: "Jídlo a dětské essentials", en: "Food and kids essentials" },
    accent: "#C8FFD9",
    textColor: "#0F172A",
    icon: "flash-outline",
    categoryId: "food",
    featured: true
  },
  {
    id: "resale",
    title: { cs: "Resale", en: "Resale" },
    accent: "#1FA5A3",
    textColor: "#E6FFFA",
    icon: "swap-horizontal-outline",
    saleOnly: true
  },
  {
    id: "good-price",
    title: { cs: "Cena", en: "Price" },
    subtitle: { cs: "Výhodné slevy", en: "Better deals" },
    accent: "#FFAA2A",
    textColor: "#FFFFFF",
    icon: "pricetags-outline",
    saleOnly: true
  },
  {
    id: "pharmacy",
    title: { cs: "Lékárna", en: "Pharmacy" },
    accent: "#61D9E9",
    textColor: "#FFFFFF",
    icon: "medical-outline",
    comingSoon: true
  },
  {
    id: "business",
    title: { cs: "Pro firmy", en: "For business" },
    accent: "#E8E2FF",
    textColor: "#2E1065",
    icon: "briefcase-outline",
    comingSoon: true
  },
  {
    id: "beauty",
    title: { cs: "Kosmetika", en: "Beauty" },
    accent: "#FFD8EC",
    textColor: "#6B2145",
    icon: "flower-outline",
    categoryId: "beauty"
  },
  {
    id: "fashion",
    title: { cs: "Oblečení", en: "Clothing" },
    accent: "#E7D3FF",
    textColor: "#4C1D95",
    icon: "shirt-outline",
    categoryId: "fashion"
  },
  {
    id: "women",
    title: { cs: "Pro ženy", en: "Women" },
    accent: "#DCFCE7",
    textColor: "#166534",
    icon: "woman-outline",
    categoryId: "fashion"
  },
  {
    id: "men",
    title: { cs: "Pro muže", en: "Men" },
    accent: "#FDE68A",
    textColor: "#854D0E",
    icon: "man-outline",
    categoryId: "fashion"
  },
  {
    id: "kids",
    title: { cs: "Pro děti", en: "Kids" },
    accent: "#DBEAFE",
    textColor: "#1D4ED8",
    icon: "happy-outline",
    categoryId: "gifts"
  },
  {
    id: "shoes",
    title: { cs: "Obuv", en: "Shoes" },
    accent: "#F5E6D3",
    textColor: "#7C2D12",
    icon: "footsteps-outline",
    categoryId: "fashion"
  },
  {
    id: "accessories",
    title: { cs: "Doplňky", en: "Accessories" },
    accent: "#D1FAE5",
    textColor: "#065F46",
    icon: "bag-handle-outline",
    categoryId: "accessories"
  },
  {
    id: "sport",
    title: { cs: "Sport", en: "Sport" },
    accent: "#CCFBF1",
    textColor: "#115E59",
    icon: "barbell-outline",
    categoryId: "premium-electronics"
  }
];
