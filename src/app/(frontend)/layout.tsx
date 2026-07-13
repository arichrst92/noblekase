/**
 * Frontend Layout — wraps all customer-facing pages
 *
 * Fonts: di-load via <link> tags ke Google Fonts (di browser user),
 * bukan via next/font/google (yang download saat build dan gagal di
 * Docker build container karena DNS isolation).
 *
 * Includes: floating top nav, footer, mobile bottom nav, chatbot bubble.
 */

import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { BottomNavMobile } from "@/components/layout/BottomNavMobile";
import { ChatbotBubble } from "@/components/chatbot/ChatbotBubble";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Noblekase — Aksesoris yang menemani hari-hari setiap orang",
    template: "%s · Noblekase",
  },
  description:
    "Brand aksesoris HP yang mengedepankan kualitas konsisten dan desain editorial untuk semua kalangan.",
  openGraph: {
    siteName: "Noblekase",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    languages: {
      id: "/id",
      en: "/en",
    },
  },
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* Preconnect untuk performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fraunces (serif) + Inter (sans) — loaded di browser, tidak saat build */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <TopNav />

        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        <Footer />

        <BottomNavMobile />

        <ChatbotBubble />
      </body>
    </html>
  );
}
