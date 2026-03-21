"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WishlistButton({ productId }: { productId: string }) {
  const [active, setActive] = useState(false);

  async function toggle() {
    const response = await fetch("/api/wishlist", {
      method: active ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });

    if (response.ok) setActive((value) => !value);
  }

  return (
    <Button variant="secondary" size="icon" className="rounded-full bg-background/80 backdrop-blur" onClick={toggle} aria-label="Toggle wishlist">
      <Heart className={active ? "fill-current" : ""} />
    </Button>
  );
}
