import Link from "next/link";
import { Container } from "@/components/shared/container";
import { SignInForm } from "@/components/forms/sign-in-form";
import { Card, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-14">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-6 pt-8">
          <div className="space-y-3">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Authentication</div>
            <h1 className="text-3xl font-semibold tracking-tight">Sign in to Maestro</h1>
            <p className="text-muted-foreground">Access your account, seller dashboard, and admin workflows.</p>
          </div>
          <SignInForm />
          <p className="text-sm text-muted-foreground">Need an account? <Link href="/auth/sign-up" className="font-medium text-primary">Create one</Link></p>
        </CardContent>
      </Card>
    </Container>
  );
}
