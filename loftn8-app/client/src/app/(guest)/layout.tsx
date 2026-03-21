import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CartBar } from "@/components/CartBar";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <div className="pb-28">{children}</div>
      </Suspense>
      <CartBar />
      <BottomNav />
    </>
  );
}