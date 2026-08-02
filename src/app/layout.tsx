import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth-provider";

import "./globals.css";

const inter = localFont({
  src: "../assets/fonts/inter.woff2",
  display: "swap",
  variable: "--font-inter",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Inspora",
    template: "%s — Inspora",
  },
  description: "A curated archive of recent visual design and creative work.",
  openGraph: {
    type: "website",
    title: "Inspora",
    description: "A curated archive of recent visual design and creative work.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-[family-name:var(--font-inter)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
