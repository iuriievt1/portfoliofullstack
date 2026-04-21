import type {
  Address,
  CatalogFilters,
  HomeFeed,
  NotificationItem,
  Order,
  PaginatedResult,
  PaymentMethod,
  PickupPoint,
  Product,
  ProductReview,
  Seller,
  Session
} from "@/types/domain";
import { calculateCartTotal } from "@/utils";

const image = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=900&q=80`;
const delay = async (duration = 350) => new Promise((resolve) => setTimeout(resolve, duration));

const categories = [
  { id: "fashion", slug: "fashion", name: "Fashion", icon: "shirt-outline" },
  { id: "accessories", slug: "accessories", name: "Accessories", icon: "diamond-outline" },
  { id: "beauty", slug: "beauty", name: "Beauty", icon: "sparkles-outline" },
  { id: "home", slug: "home", name: "Home / Decor", icon: "home-outline" },
  { id: "gifts", slug: "gifts", name: "Gifts / Trendy", icon: "gift-outline" },
  { id: "electronics", slug: "electronics", name: "Electronics", icon: "phone-portrait-outline" },
  {
    id: "premium-electronics",
    slug: "premium-electronics",
    name: "Expensive Electronics",
    icon: "laptop-outline"
  },
  { id: "food", slug: "food", name: "Food / Supplements", icon: "nutrition-outline" }
];

const sellers: Seller[] = [
  {
    id: "s1",
    name: "Praha Studio",
    rating: 4.8,
    deliverySpeed: "Doručení 1-2 dny",
    returnPolicy: "Vrácení do 30 dnů"
  },
  {
    id: "s2",
    name: "Nordic Nest CZ",
    rating: 4.7,
    deliverySpeed: "Vyzvednutí dnes",
    returnPolicy: "Vrácení do 14 dnů"
  },
  {
    id: "s3",
    name: "Glow Market",
    rating: 4.9,
    deliverySpeed: "Kurýr zítra",
    returnPolicy: "Vrácení do 30 dnů"
  }
];

const products: Product[] = [
  {
    id: "p1",
    name: "Minimalistická kabelka Luna",
    slug: "luna-bag",
    description: "Čistá silueta, lehká konstrukce a kvalitní veganská kůže pro každodenní nošení.",
    categoryId: "fashion",
    sellerId: "s1",
    price: 1699,
    oldPrice: 2199,
    rating: 4.8,
    reviewCount: 126,
    stockStatus: "in_stock",
    pickupToday: true,
    deliveryTomorrow: true,
    images: [image("photo-1529139574466-a303027c1d8b")],
    badges: ["Sleva", "Top"],
    brand: "Luna",
    specs: { Material: "Veganská kůže", Barva: "Černá", Rozměr: "28 x 21 cm" }
  },
  {
    id: "p2",
    name: "Smart watch Air Pulse",
    slug: "air-pulse-watch",
    description: "Prémiové hodinky s AMOLED displejem a výdrží až 7 dní.",
    categoryId: "premium-electronics",
    sellerId: "s2",
    price: 6490,
    oldPrice: 7590,
    rating: 4.9,
    reviewCount: 88,
    stockStatus: "in_stock",
    pickupToday: false,
    deliveryTomorrow: true,
    images: [image("photo-1546868871-7041f2a55e12"),],
    badges: ["Novinky"],
    brand: "Air Pulse",
    specs: { Display: "AMOLED", Baterie: "7 dní", Voděodolnost: "5 ATM" }
  },
  {
    id: "p3",
    name: "Set keramických váz",
    slug: "ceramic-vase-set",
    description: "Elegantní dekorace pro moderní interiér ve skandinávském stylu.",
    categoryId: "home",
    sellerId: "s2",
    price: 1190,
    rating: 4.6,
    reviewCount: 42,
    stockStatus: "low_stock",
    pickupToday: true,
    deliveryTomorrow: false,
    images: [image("photo-1517705008128-361805f42e86"), image("photo-1505693416388-ac5ce068fe85")],
    badges: ["Skladem"],
    brand: "Nordic Nest",
    specs: { Materiál: "Keramika", Kusy: "3", Výška: "18-28 cm" }
  },
  {
    id: "p4",
    name: "Hydratační serum Glow+",
    slug: "glow-serum",
    description: "Kosmetické serum s niacinamidem a lehkou texturou, vhodné pro každodenní péči.",
    categoryId: "beauty",
    sellerId: "s3",
    price: 590,
    oldPrice: 790,
    rating: 4.7,
    reviewCount: 210,
    stockStatus: "in_stock",
    pickupToday: true,
    deliveryTomorrow: true,
    images: [image("photo-1556228578-8c89e6adf883"), image("photo-1620916566398-39f1143ab7be")],
    badges: ["Sleva", "Vyzvednutí dnes"],
    brand: "Glow+",
    specs: { Objem: "30 ml", Typ: "Serum", Použití: "Pleť" }
  },
  {
    id: "p5",
    name: "Bluetooth sluchátka Arc Mini",
    slug: "arc-mini",
    description: "Lehká bezdrátová sluchátka s ANC a kompaktním pouzdrem.",
    categoryId: "electronics",
    sellerId: "s1",
    price: 2290,
    rating: 4.5,
    reviewCount: 61,
    stockStatus: "in_stock",
    pickupToday: false,
    deliveryTomorrow: true,
    images: [image("photo-1505740420928-5e560c06d30e"), image("photo-1484704849700-f032a568e944")],
    badges: ["Top"],
    brand: "Arc",
    specs: { Baterie: "24 h", ANC: "Ano", Bluetooth: "5.3" }
  },
  {
    id: "p6",
    name: "Dárkový box Sweet Praha",
    slug: "sweet-praha",
    description: "Kurátorovaný gift box s lokálními sladkostmi a designovými doplňky.",
    categoryId: "gifts",
    sellerId: "s3",
    price: 990,
    rating: 4.9,
    reviewCount: 34,
    stockStatus: "in_stock",
    pickupToday: true,
    deliveryTomorrow: true,
    images: [image("photo-1513475382585-d06e58bcb0e0"), image("photo-1549465220-1a8b9238cd48")],
    badges: ["Novinky"],
    brand: "Velora",
    specs: { Obsah: "5 kusů", Styl: "Gift box", Původ: "Praha" }
  },
  {
    id: "p7",
    name: "Protein vanilla blend",
    slug: "protein-vanilla-blend",
    description: "Doplněk stravy pro aktivní životní styl. Bez farmacie a regulovaných látek.",
    categoryId: "food",
    sellerId: "s3",
    price: 799,
    rating: 4.4,
    reviewCount: 72,
    stockStatus: "in_stock",
    pickupToday: false,
    deliveryTomorrow: true,
    images: [image("photo-1579722820308-d74e571900a9"), image("photo-1514995669114-6081e934b693")],
    badges: ["Skladem"],
    brand: "Daily Fuel",
    specs: { Hmotnost: "900 g", Příchuť: "Vanilka", Typ: "Protein" }
  },
  {
    id: "p8",
    name: "Kožený pásek Atelier",
    slug: "atelier-belt",
    description: "Doplňek do kapsulového šatníku s minimalistickou přezkou.",
    categoryId: "accessories",
    sellerId: "s1",
    price: 690,
    rating: 4.8,
    reviewCount: 49,
    stockStatus: "in_stock",
    pickupToday: true,
    deliveryTomorrow: false,
    images: [image("photo-1624222247344-550fb60583dc"), image("photo-1523381210434-271e8be1f52b")],
    badges: ["Top"],
    brand: "Atelier",
    specs: { Materiál: "Kůže", Barva: "Hnědá", Šířka: "3 cm" }
  }
];

const reviews: ProductReview[] = [
  {
    id: "r1",
    productId: "p1",
    author: "Lenka",
    rating: 5,
    text: "Skvělá kvalita a rychlé vyzvednutí.",
    createdAt: "2026-04-12T11:00:00.000Z"
  },
  {
    id: "r2",
    productId: "p1",
    author: "Michaela",
    rating: 4,
    text: "Pěkný materiál, odpovídá fotkám.",
    createdAt: "2026-04-09T09:10:00.000Z"
  },
  {
    id: "r3",
    productId: "p4",
    author: "Petra",
    rating: 5,
    text: "Lehká textura, používám každý den.",
    createdAt: "2026-04-02T07:00:00.000Z"
  }
];

const addresses: Address[] = [
  {
    id: "a1",
    label: "Domov",
    fullName: "Klára Nováková",
    phone: "+420777123123",
    street: "Korunní 28",
    city: "Praha",
    postalCode: "12000",
    isDefault: true
  }
];

const pickupPoints: PickupPoint[] = [
  {
    id: "pp1",
    name: "Zásilkovna Flora",
    address: "Jičínská 12, Praha 3",
    city: "Praha",
    distanceKm: 1.2,
    opensAt: "08:00",
    closesAt: "20:00",
    availability: "Dnes po 17:00",
    supportedMethods: ["pickup_point", "locker"]
  },
  {
    id: "pp2",
    name: "Box Karlín",
    address: "Sokolovská 54, Praha 8",
    city: "Praha",
    distanceKm: 2.5,
    opensAt: "00:00",
    closesAt: "23:59",
    availability: "Dnes po 15:00",
    supportedMethods: ["locker"]
  },
  {
    id: "pp3",
    name: "Praha Studio Pickup",
    address: "Vinohradská 33, Praha 2",
    city: "Praha",
    distanceKm: 0.8,
    opensAt: "10:00",
    closesAt: "19:00",
    availability: "Ihned k dispozici",
    supportedMethods: ["pickup_point", "store_pickup"]
  }
];

const paymentMethods: PaymentMethod[] = [
  { id: "pm1", type: "card", label: "Visa •••• 4242", isDefault: true },
  { id: "pm2", type: "apple_pay", label: "Apple Pay", isDefault: false }
];

let orders: Order[] = [
  {
    id: "o1",
    number: "VM-240415-001",
    status: "ready_for_pickup",
    createdAt: "2026-04-15T14:00:00.000Z",
    items: [{ id: "oi1", productId: "p1", quantity: 1, price: 1699 }],
    sellerIds: ["s1"],
    deliveryMethod: "pickup_point",
    pickupPointId: "pp3",
    paymentMethod: "card",
    subtotal: 1699,
    deliveryFee: 0,
    discount: 150,
    total: 1549,
    pickupCode: "873621"
  }
];

let notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Objednávka připravena k vyzvednutí",
    body: "Vaše objednávka VM-240415-001 čeká ve Vinohradech.",
    category: "order",
    createdAt: "2026-04-16T10:00:00.000Z",
    unread: true
  },
  {
    id: "n2",
    title: "Sleva na beauty",
    body: "Dnešní beauty picks mají až 20 % dolů.",
    category: "promo",
    createdAt: "2026-04-14T07:00:00.000Z",
    unread: false
  }
];

const session: Session = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  user: {
    id: "u1",
    firstName: "Klára",
    lastName: "Nováková",
    email: "klara@example.com",
    phone: "+420777123123"
  }
};

export const mockApi = {
  async login(input: { firstName: string; lastName: string; email: string; phone: string }) {
    await delay();
    return {
      ...session,
      user: {
        ...session.user,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone
      }
    };
  },
  async getHomeFeed(): Promise<HomeFeed> {
    await delay();
    return {
      banners: [
        {
          id: "b1",
          title: "Praha picks",
          subtitle: "Kurátorované lokální trendy",
          imageUrl: image("photo-1500530855697-b586d89ba3ee"),
          cta: "Prohlédnout"
        },
        {
          id: "b2",
          title: "Beauty week",
          subtitle: "Péče, která přijde už zítra",
          imageUrl: image("photo-1522335789203-aabd1fc54bc9"),
          cta: "Nakupovat"
        }
      ],
      categories,
      hotDeals: products.filter((product) => product.oldPrice),
      trending: products.slice(0, 4),
      recommended: products.slice(2, 8),
      newSellers: sellers,
      pickupToday: products.filter((product) => product.pickupToday)
    };
  },
  async getCatalog(page = 1, pageSize = 8, filters?: CatalogFilters): Promise<PaginatedResult<Product>> {
    await delay(420);
    const filtered = products.filter((product) => {
      if (filters?.query) {
        const query = filters.query.toLowerCase();
        const haystack = `${product.name} ${product.brand}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      if (filters?.categoryId && product.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters?.saleOnly && !product.oldPrice) {
        return false;
      }
      if (filters?.brand && product.brand !== filters.brand) {
        return false;
      }
      if (filters?.sellerId && product.sellerId !== filters.sellerId) {
        return false;
      }
      if (filters?.inStock && product.stockStatus === "out_of_stock") {
        return false;
      }
      if (filters?.pickupToday && !product.pickupToday) {
        return false;
      }
      if (filters?.deliveryTomorrow && !product.deliveryTomorrow) {
        return false;
      }
      if (filters?.rating && product.rating < filters.rating) {
        return false;
      }
      if (filters?.minPrice && product.price < filters.minPrice) {
        return false;
      }
      if (filters?.maxPrice && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    });

    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data,
      page,
      pageSize,
      hasNextPage: startIndex + pageSize < filtered.length,
      total: filtered.length
    };
  },
  async getProduct(productId: string) {
    await delay();
    return products.find((product) => product.id === productId) ?? null;
  },
  async getProductReviews(productId: string) {
    await delay();
    return reviews.filter((review) => review.productId === productId);
  },
  async getSeller(sellerId: string) {
    await delay();
    return sellers.find((seller) => seller.id === sellerId) ?? null;
  },
  async getSellerProducts(sellerId: string) {
    await delay();
    return products.filter((product) => product.sellerId === sellerId);
  },
  async getOrders() {
    await delay();
    return orders;
  },
  async getOrder(orderId: string) {
    await delay();
    return orders.find((order) => order.id === orderId) ?? null;
  },
  async getAddresses() {
    await delay();
    return addresses;
  },
  async upsertAddress(input: Omit<Address, "id" | "isDefault"> & { id?: string }) {
    await delay();
    if (input.id) {
      const index = addresses.findIndex((address) => address.id === input.id);
      addresses[index] = { ...addresses[index], ...input };
      return addresses[index];
    }

    const created = { ...input, id: `a${Date.now()}`, isDefault: addresses.length === 0 };
    addresses.push(created);
    return created;
  },
  async deleteAddress(id: string) {
    await delay();
    const index = addresses.findIndex((address) => address.id === id);
    if (index >= 0) {
      addresses.splice(index, 1);
    }
    return true;
  },
  async getNotifications() {
    await delay();
    return notifications;
  },
  async getPickupPoints(query?: string) {
    await delay();
    return pickupPoints.filter((point) => !query || point.name.toLowerCase().includes(query.toLowerCase()));
  },
  async getPaymentMethods() {
    await delay();
    return paymentMethods;
  },
  async placeOrder(input: {
    cartItems: { productId: string; quantity: number }[];
    deliveryMethod: Order["deliveryMethod"];
    pickupPointId?: string;
    addressId?: string;
    paymentMethod: Order["paymentMethod"];
  }) {
    await delay(650);
    const subtotal = calculateCartTotal(
      input.cartItems.map((item) => ({
        ...item,
        id: item.productId,
        sellerId: products.find((product) => product.id === item.productId)?.sellerId ?? "s1"
      })),
      products
    );

    const nextOrder: Order = {
      id: `o${Date.now()}`,
      number: `VM-${Date.now().toString().slice(-9)}`,
      status: input.deliveryMethod === "pickup_point" ? "processing" : "paid",
      createdAt: new Date().toISOString(),
      items: input.cartItems.map((item) => ({
        id: `${item.productId}-${Date.now()}`,
        productId: item.productId,
        quantity: item.quantity,
        price: products.find((product) => product.id === item.productId)?.price ?? 0
      })),
      sellerIds: [
        ...new Set(
          input.cartItems.map(
            (item) => products.find((product) => product.id === item.productId)?.sellerId ?? "s1"
          )
        )
      ],
      deliveryMethod: input.deliveryMethod,
      pickupPointId: input.pickupPointId,
      addressId: input.addressId,
      paymentMethod: input.paymentMethod,
      subtotal,
      deliveryFee: input.deliveryMethod === "courier" ? 99 : 0,
      discount: subtotal > 3000 ? 150 : 0,
      total: subtotal + (input.deliveryMethod === "courier" ? 99 : 0) - (subtotal > 3000 ? 150 : 0),
      pickupCode: input.deliveryMethod === "pickup_point" ? "564221" : undefined
    };

    orders = [nextOrder, ...orders];
    notifications = [
      {
        id: `n${Date.now()}`,
        title: "Objednávka přijata",
        body: `Objednávka ${nextOrder.number} byla úspěšně vytvořena.`,
        category: "order",
        createdAt: new Date().toISOString(),
        unread: true
      },
      ...notifications
    ];

    return nextOrder;
  },
  async submitSupportTicket() {
    await delay();
    return { ok: true };
  },
  async submitReturnRequest() {
    await delay();
    return { ok: true };
  },
  async submitReview() {
    await delay();
    return { ok: true };
  },
  categories,
  products,
  sellers,
  reviews
};
