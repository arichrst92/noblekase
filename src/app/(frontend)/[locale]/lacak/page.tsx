/**
 * /lacak — halaman lacak pesanan (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import type { Metadata } from "next";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { TrackOrder } from "@/components/orders/TrackOrder";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const meta = await buildMetadata({
    title: t(locale, "track.title"),
    path: "/lacak",
    locale,
  });
  // Halaman utilitas transaksional — jangan diindeks.
  return { ...meta, robots: { index: false, follow: true } };
}

export default async function TrackPage({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <>
      <RevealOnScroll />
      <section className="pt-28 md:pt-32 pb-24 md:pb-20">
        <div className="container-prose">
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-8 tracking-tight">
            {t(locale, "track.title")}
          </h1>
          <TrackOrder locale={locale} />
        </div>
      </section>
    </>
  );
}
