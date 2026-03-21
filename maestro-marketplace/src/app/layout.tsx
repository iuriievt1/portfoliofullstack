import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { createMetadata } from "@/lib/seo";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = createMetadata({
  title: "Maestro",
  description: "A premium multi-vendor marketplace for modern brands, elegant products, and scalable commerce.",
  path: "/"
});

function HeaderFallback() {
  return (
    <div className="sticky top-0 z-40 h-20 border-b border-border/80 bg-background/95 backdrop-blur" />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(38,157,78,0.08),transparent_32%),linear-gradient(to_bottom,#ffffff,#fbfdfb)]">
          <Suspense fallback={<HeaderFallback />}>
            <SiteHeader />
          </Suspense>
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
