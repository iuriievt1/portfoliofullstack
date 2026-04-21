export type DeliveryMethod = "pickup_point" | "locker" | "courier" | "store_pickup";
export type PaymentMethodType = "card" | "apple_pay" | "google_pay" | "cash_on_delivery";
export type SupportedCountry = "cz";
export type SupportedCity = "praha" | "brno" | "plzen" | "karlovy-vary";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled"
  | "returned";

export type NotificationCategory = "order" | "promo" | "system" | "favorites";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  sellerId: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  pickupToday: boolean;
  deliveryTomorrow: boolean;
  images: string[];
  badges: string[];
  brand: string;
  specs: Record<string, string>;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

export type Seller = {
  id: string;
  name: string;
  rating: number;
  deliverySpeed: string;
  returnPolicy: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  cta: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  sellerId: string;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type PickupPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  distanceKm: number;
  opensAt: string;
  closesAt: string;
  availability: string;
  supportedMethods: DeliveryMethod[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  createdAt: string;
  unread: boolean;
};

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  label: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
  }[];
  sellerIds: string[];
  deliveryMethod: DeliveryMethod;
  pickupPointId?: string;
  addressId?: string;
  paymentMethod: PaymentMethodType;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  pickupCode?: string;
};

export type HomeFeed = {
  banners: Banner[];
  categories: Category[];
  hotDeals: Product[];
  trending: Product[];
  recommended: Product[];
  newSellers: Seller[];
  pickupToday: Product[];
};

export type CatalogFilters = {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  saleOnly?: boolean;
  brand?: string;
  sellerId?: string;
  rating?: number;
  inStock?: boolean;
  pickupToday?: boolean;
  deliveryTomorrow?: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  total: number;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
