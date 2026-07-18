/**
 * /tentang — Brand story page (block-based dari koleksi Pages, slug "tentang").
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { PageBlocks } from "@/components/pages/PageBlocks";
import { getPageBySlug, resolveMediaUrl } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

// Render dinamis — lihat catatan di src/app/(frontend)/[locale]/[...slug]/page.tsx
export const dynamic = "force-dynamic";

interface TentangPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TentangPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const page = await getPageBySlug("tentang", locale);
  // Fallback gambar: SEO override → gambar hero block pertama → default situs
  const heroBlock = (page?.blocks ?? []).find((b: { blockType?: string }) => b.blockType === "hero");
  return buildMetadata({
    title: page?.seo?.title ?? page?.title ?? t(locale, "about.metaTitle"),
    description: page?.seo?.description ?? t(locale, "about.metaDescription"),
    path: "/tentang",
    image:
      resolveMediaUrl(page?.seo?.ogImage, "og") ||
      resolveMediaUrl(heroBlock?.image, "og") ||
      undefined,
    locale,
  });
}

export default async function TentangPage({ params }: TentangPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const page = await getPageBySlug("tentang", locale);
  if (!page) notFound();

  return (
    <>
      <RevealOnScroll />
      <PageBlocks blocks={page.blocks ?? []} locale={locale} />
    </>
  );
}
