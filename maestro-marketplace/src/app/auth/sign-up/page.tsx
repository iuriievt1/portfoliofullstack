import Link from "next/link";
import { Container } from "@/components/shared/container";
import { SignUpForm } from "@/components/forms/sign-up-form";
import { Card, CardContent } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-6 pt-8">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Join Maestro</div>
            <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Start shopping, save products, and upgrade to a seller account later.</p>
          </div>
          <SignUpForm />
          <p className="text-sm text-muted-foreground">Already have an account? <Link href="/auth/sign-in" className="font-medium text-primary">Sign in</Link></p>
        </CardContent>
      </Card>
    </Container>
  );
}
