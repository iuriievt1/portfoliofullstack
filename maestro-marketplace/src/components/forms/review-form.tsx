"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({ productId }: { productId: string }) {
  const [status, setStatus] = useState("");

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      productId,
      rating: Number(formData.get("rating")),
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || "")
    };

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus(response.ok ? "Review submitted." : "Please sign in to review.");
  }

  return (
    <form onSubmit={submitReview} className="space-y-4 rounded-3xl border border-border p-6">
      <h3 className="text-lg font-semibold">Write a review</h3>
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <Input id="rating" name="rating" type="number" min="1" max="5" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" maxLength={80} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Review</Label>
        <Textarea id="body" name="body" required />
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      <Button type="submit">Submit review</Button>
    </form>
  );
}
