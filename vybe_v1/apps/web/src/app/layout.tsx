import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VYBE",
  description: "Live geo-social platform for discovering what is happening right now."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

