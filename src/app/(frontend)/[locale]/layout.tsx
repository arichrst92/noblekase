/**
 * Frontend Layout — wraps all customer-facing pages
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Fonts: di-load via <link> tags ke Google Fonts (di browser user),
 * bukan via next/font/google (yang download saat build dan gagal di
 * Docker build container karena DNS isolation).
 *
 * Includes: floating top nav, footer, mobile bottom nav, chatbot bubble.
 *
 * Dua bahasa: segmen [locale] menentukan bahasa seluruh subtree. Nilainya
 * dioper ke setiap query CMS (agar Payload mengembalikan field terjemahan)
 * dan ke komponen layout (agar teks UI serta prefix tautan ikut menyesuaikan).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import {
  htmlLang,
  isLocale,
  locales,
  ogLocale,
  t,
  type Locale,
} from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";
import "./globals.css";

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

/** Prerender kedua bahasa; locale lain jatuh ke notFound(). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "id";
  const s = await getSiteSettings(locale);
  const siteName = s?.siteName ?? "Noblekase";
  const tagline = s?.tagline ?? t(locale, "site.taglineFallback");
  const description =
    s?.defaultMetaDescription ?? t(locale, "site.metaDescriptionFallback");
  const ogImage = resolveMediaUrl(s?.defaultOgImage, "og");
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s · ${siteName}`,
    },
    description,
    openGraph: {
      siteName,
      locale: ogLocale[locale],
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image" },
    ...(s?.googleSiteVerification
      ? { verification: { google: s.googleSiteVerification } }
      : {}),
    alternates: { languages: languageAlternates("/") },
  };
}

export default async function FrontendLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;

  const [header, footer, settings, integrations] = await Promise.all([
    getHeaderNav(locale),
    getFooterData(locale),
    getSiteSettings(locale),
    getIntegrations(locale),
  ]);

  // Logo: pakai upload CMS bila ada, jika tidak fallback ke file statis.
  const logoUrl =
    resolveMediaUrl(settings?.logo) || "/images/noblekase-logo.png";

  // Monogram brand — dipakai tombol tengah bottom nav mobile. Diambil dari
  // field Favicon karena bentuknya persegi; logo utama berupa wordmark.
  //
  // Sengaja memakai URL berkas ASLI, bukan varian "thumbnail". Varian hanya
  // ada bila Sharp sempat membuatnya saat upload; untuk berkas SVG varian
  // tidak pernah dibuat sama sekali. Menunjuk varian yang tidak ada membuat
  // gambar 404 dan tombolnya tampak polos tanpa pesan error apa pun.
  const iconUrl =
    resolveMediaUrl(settings?.favicon) || "/images/brand/favicon-noblekase.png";

  // Google Analytics 4: dari CMS, fallback ke env.
  const gaId =
    integrations?.gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaEnabled = !!gaId && !gaId.includes("XXXX");

  return (
    <html lang={htmlLang[locale]}>
      <head>
        {/* Preconnect untuk performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Fraunces (serif) + Inter (sans) — loaded di browser, tidak saat build */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        {gaEnabled && <Analytics measurementId={gaId!} />}

        <SiteJsonLd
          locale={locale}
          siteName={settings?.siteName ?? "Noblekase"}
          logoUrl={logoUrl}
          socialUrls={(settings?.social ?? [])
            .map((s: { url?: string }) => s?.url)
            .filter(Boolean)}
        />

        <TopNav
          navItems={header.navItems}
          brand={settings?.siteName}
          logoUrl={logoUrl}
          locale={locale}
        />

        <main className="flex-1 pb-24 md:pb-0">{children}</main>

        <Footer
          brand={settings?.siteName}
          logoUrl={logoUrl}
          tagline={footer.tagline}
          columns={footer.columns}
          copyrightText={footer.copyrightText}
          legalLinks={footer.legalLinks}
          locale={locale}
        />

        <BottomNavMobile
          items={header.mobileBottomNav}
          locale={locale}
          iconUrl={iconUrl}
        />

        <ChatbotBubble
          enabled={settings?.chatbotEnabled !== false}
          title={settings?.chatbotTitle ?? undefined}
          statusText={settings?.chatbotStatusText ?? undefined}
          placeholder={settings?.chatbotInputPlaceholder ?? undefined}
          /* Site Settings menyimpan sapaan chatbot sebagai dua field terpisah
             (chatbotGreetingId / chatbotGreetingEn), bukan satu field
             localized seperti field chatbot lainnya. Jadi pemilihannya
             dilakukan manual di sini — tanpa ini pembaca versi Inggris
             disapa dalam Bahasa Indonesia. */
          greeting={
            (locale === "en"
              ? settings?.chatbotGreetingEn
              : settings?.chatbotGreetingId) ?? undefined
          }
          autoTriggerSeconds={Number(settings?.chatbotAutoTriggerSeconds ?? 0)}
          locale={locale}
        />
      </body>
    </html>
  );
}
