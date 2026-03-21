export const APP_NAME = "Maestro";

export const mainNavigation = [
  { href: "/products", label: "Shop" },
  { href: "/search", label: "Search" },
  { href: "/help", label: "Help" }
];

export const sellerNavigation = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/analytics", label: "Analytics" },
  { href: "/seller/promotions", label: "Promotions" }
];

export const adminNavigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" }
];

export const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" }
];
