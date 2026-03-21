import { requireUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SellerOnboardingForm } from "@/components/forms/seller-onboarding-form";

export default async function SellerOnboardingPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Seller onboarding</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Apply to sell on Maestro</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <SellerOnboardingForm defaultValues={{
            supportEmail: user.email,
            storeName: user.sellerProfile?.storeName,
            legalName: user.sellerProfile?.legalName ?? "",
            description: user.sellerProfile?.description ?? ""
          }} />
        </CardContent>
      </Card>
    </div>
  );
}
