"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SellerOnboardingForm({
  defaultValues
}: {
  defaultValues?: {
    storeName?: string;
    legalName?: string;
    supportEmail?: string;
    description?: string;
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/seller/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: String(formData.get("storeName") || ""),
        legalName: String(formData.get("legalName") || ""),
        supportEmail: String(formData.get("supportEmail") || ""),
        description: String(formData.get("description") || "")
      })
    });

    setStatus(response.ok ? "Application submitted." : "Unable to submit.");
    if (response.ok) {
      router.push("/seller");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="storeName">Store name</Label>
        <Input id="storeName" name="storeName" defaultValue={defaultValues?.storeName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="legalName">Legal name</Label>
        <Input id="legalName" name="legalName" defaultValue={defaultValues?.legalName} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="supportEmail">Support email</Label>
        <Input id="supportEmail" name="supportEmail" type="email" defaultValue={defaultValues?.supportEmail} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Store description</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description} required />
      </div>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      <Button type="submit">Submit onboarding</Button>
    </form>
  );
}
