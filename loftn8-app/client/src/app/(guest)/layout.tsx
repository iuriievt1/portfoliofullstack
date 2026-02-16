import { BottomNav } from "@/components/BottomNav";
import { CartBar } from "@/components/CartBar";
import { AuthGateSheet } from "@/components/AuthGateSheet";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthGateSheet />
      <div className="pb-28">{children}</div>
      <CartBar />
      <BottomNav />
    </>
  );
}
