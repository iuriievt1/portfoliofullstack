import { z } from "zod";

import type { CartItem, Product } from "@/types/domain";

export const authSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9)
});

export const addressSchema = z.object({
  label: z.string().min(2),
  fullName: z.string().min(2),
  phone: z.string().min(9),
  street: z.string().min(4),
  city: z.string().min(2),
  postalCode: z.string().min(5)
});

export const supportSchema = z.object({
  topic: z.string().min(2),
  message: z.string().min(10)
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(5)
});

export const returnSchema = z.object({
  reason: z.string().min(4),
  note: z.string().min(4)
});

export const checkoutContactSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9)
});

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0
  }).format(value);

export const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "short"
  }).format(new Date(date));

export const formatFullDate = (date: string) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));

export const getDiscountPercent = (product: Product) => {
  if (!product.oldPrice || product.oldPrice <= product.price) {
    return 0;
  }

  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
};

export const calculateCartTotal = (items: CartItem[], products: Product[]) =>
  items.reduce((accumulator, item) => {
    const product = products.find((currentProduct) => currentProduct.id === item.productId);
    return accumulator + (product?.price ?? 0) * item.quantity;
  }, 0);

export const groupBy = <T>(items: T[], getKey: (item: T) => string) =>
  items.reduce<Record<string, T[]>>((accumulator, item) => {
    const key = getKey(item);
    accumulator[key] = accumulator[key] ? [...accumulator[key], item] : [item];
    return accumulator;
  }, {});
