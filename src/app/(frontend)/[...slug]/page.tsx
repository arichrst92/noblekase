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

interface DynamicPageProps {
  params: Promise<{ slug: string[] }>;
}

/** Gabungkan segmen jadi satu slug — CMS memakai slug satu tingkat. */
const toSlug = (segments: string[]) => segments.join("/");

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(toSlug(slug));
  if (!page) return { title: "Halaman tidak ditemukan", robots: { index: false } };

  return buildMetadata({
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
    path: `/${toSlug(slug)}`,
    image: resolveMediaUrl(page.seo?.ogImage, "og") || undefined,
  });
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(toSlug(slug));
  if (!page) notFound();

  return (
    <>
      <RevealOnScroll />
      <PageBlocks blocks={page.blocks ?? []} />
    </>
  );
}
