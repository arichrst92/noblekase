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
import {
  getHeaderNav,
  getFooterData,
  getSiteSettings,
  getIntegrations,
  resolveMediaUrl,
} from "@/lib/queries";
import { Analytics } from "@/components/analytics/Analytics";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const siteName = s?.siteName ?? "Noblekase";
  const tagline = s?.tagline ?? "Aksesoris yang menemani hari-hari setiap orang";
  const description =
    s?.defaultMetaDescription ??
    "Brand aksesoris HP yang mengedepankan kualitas konsisten dan desain editorial untuk semua kalangan.";
  const ogImage = resolveMediaUrl(s?.defaultOgImage, "og");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s · ${siteName}`,
    },
    description,
    openGraph: {
      siteName,
      locale: "id_ID",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image" },
    ...(s?.googleSiteVerification
      ? { verification: { google: s.googleSiteVerification } }
      : {}),
    alternates: {
      languages: { id: "/id", en: "/en" },
    },
  };
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [header, footer, settings, integrations] = await Promise.all([
    getHeaderNav(),
    getFooterData(),
    getSiteSettings(),
    getIntegrations(),
  ]);

  // Logo: pakai upload CMS bila ada, jika tidak fallback ke file statis.
  const logoUrl = resolveMediaUrl(settings?.logo) || "/images/noblekase-logo.png";

  // Google Analytics 4: dari CMS, fallback ke env.
  const gaId = integrations?.gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaEnabled = !!gaId && !gaId.includes("XXXX");

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
        {gaEnabled && <Analytics measurementId={gaId!} />}

        <SiteJsonLd
          siteName={settings?.siteName ?? "Noblekase"}
          logoUrl={logoUrl}
          socialUrls={(settings?.social ?? [])
            .map((s: { url?: string }) => s?.url)
            .filter(Boolean)}
        />

        <TopNav navItems={header.navItems} brand={settings?.siteName} logoUrl={logoUrl} />

        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        <Footer
          brand={settings?.siteName}
          logoUrl={logoUrl}
          tagline={footer.tagline}
          columns={footer.columns}
          copyrightText={footer.copyrightText}
          legalLinks={footer.legalLinks}
        />

        <BottomNavMobile items={header.mobileBottomNav} />

        <ChatbotBubble />
      </body>
    </html>
  );
}
