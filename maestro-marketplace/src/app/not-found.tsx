import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-24">
      <div className="max-w-lg space-y-6 text-center">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</div>
        <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground">The page you requested does not exist or may have been moved.</p>
        <Link href="/"><Button>Go back home</Button></Link>
      </div>
    </Container>
  );
}
