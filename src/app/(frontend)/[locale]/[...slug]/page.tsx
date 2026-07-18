/**
 * Halaman dinamis dari koleksi Pages — mis. /privacy, /terms, /garansi.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Rute catch-all ini berada PALING BAWAH prioritas: semua rute statis
 * (/produk, /journal, /tentang, /cari, dst) tetap menang. Fungsinya dua:
 *   1. Setiap entri Pages di CMS otomatis punya URL tanpa perlu kode baru.
 *   2. Path yang tidak dikenal jatuh ke notFound() sehingga memakai
 *      halaman 404 ber-brand milik grup (frontend) — lengkap dengan
 *      navbar & footer. Tanpa rute ini, Next memakai 404 bawaannya.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { PageBlocks } from "@/components/pages/PageBlocks";
import { getPageBySlug, resolveMediaUrl } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, t, type Locale } from "@/lib/i18n";

// Render dinamis (bukan SSG) — halaman ini mengambil konten dari Payload
// (koleksi Pages) via DB. Tanpa ini, `next build` mencoba prerender halaman
// ini secara statis dan gagal karena Postgres belum jalan/reachable saat
// image Docker di-build (build image dan start container adalah dua
// tahap terpisah).
export const dynamic = "force-dynamic";

interface DynamicPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

/** Gabungkan segmen jadi satu slug — CMS memakai slug satu tingkat. */
const toSlug = (segments: string[]) => segments.join("/");

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const page = await getPageBySlug(toSlug(slug), locale);
  if (!page) return { title: t(locale, "notFound.metaTitle"), robots: { index: false } };

  return buildMetadata({
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
    path: `/${toSlug(slug)}`,
    image: resolveMediaUrl(page.seo?.ogImage, "og") || undefined,
    locale,
  });
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const page = await getPageBySlug(toSlug(slug), locale);
  if (!page) notFound();

  return (
    <>
      <RevealOnScroll />
      <PageBlocks blocks={page.blocks ?? []} locale={locale} />
    </>
  );
}
