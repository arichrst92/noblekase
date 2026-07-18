/**
 * seo.ts — pembangun metadata terpusat (OG image, canonical, twitter card).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Urutan fallback gambar OG:
 *   1. Override editor (field SEO → OG Image di koleksi terkait)
 *   2. Gambar utama konten (foto produk / hero artikel / gambar kategori)
 *   3. Default situs (Site Settings → Default OG Image)
 *
 * Semua URL relatif diresolusi ke absolut lewat `metadataBase` di root layout.
 */

import type { Metadata } from "next";
import { getSiteSettings, resolveMediaUrl } from "@/lib/queries";

export interface BuildMetadataArgs {
  title: string;
  description?: string;
  /** Path kanonik, mis. "/produk" atau "/journal/slug" */
  path: string;
  /** URL gambar OG (sudah varian 1200×630 bila dari media) */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

export async function buildMetadata(args: BuildMetadataArgs): Promise<Metadata> {
  const settings = await getSiteSettings();
  const fallbackOg = resolveMediaUrl(settings?.defaultOgImage, "og");
  const image = args.image || fallbackOg || undefined;
  const siteName = settings?.siteName ?? "Noblekase";

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical: args.path },
    openGraph: {
      title: args.title,
      description: args.description,
      url: args.path,
      siteName,
      locale: "id_ID",
      type: args.type ?? "website",
      ...(args.publishedTime ? { publishedTime: args.publishedTime } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
