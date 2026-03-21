"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  variantId,
  quantity
}: {
  productId: string;
  variantId?: string | null;
  quantity: number;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAdd() {
    setLoading(true);
    setDone(false);

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ productId, variantId, quantity })
    });

    setLoading(false);
    setDone(response.ok);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <Button size="sm" onClick={handleAdd} disabled={loading}>
      <ShoppingBag className="mr-2 h-4 w-4" />
      {loading ? "Adding..." : done ? "Added" : "Add"}
    </Button>
  );
}
