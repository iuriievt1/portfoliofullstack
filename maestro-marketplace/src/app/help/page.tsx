import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "How does seller onboarding work?",
    answer: "Sellers submit store details, pass admin moderation, complete payout readiness, and then publish products."
  },
  {
    question: "How are orders handled in a multi-vendor checkout?",
    answer: "Maestro groups cart items by seller, creates seller-specific order records, and keeps marketplace-level payment readiness."
  },
  {
    question: "Is Maestro payment-ready?",
    answer: "Yes. The architecture is prepared for Stripe Checkout and Stripe Connect payouts while still supporting local development without live keys."
  }
];

export default function HelpPage() {
  return (
    <Container className="space-y-10 py-14">
      <SectionHeading eyebrow="Help center" title="Support, policies, and marketplace guidance" description="Launch-ready help content for customers, sellers, and operators." />
      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold">{faq.question}</h2>
              <p className="mt-3 text-muted-foreground">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
