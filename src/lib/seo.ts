/**
 * seo.ts — pembangun metadata terpusat (OG image, canonical, hreflang, twitter).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Urutan fallback gambar OG:
 *   1. Override editor (field SEO → OG Image di koleksi terkait)
 *   2. Gambar utama konten (foto produk / hero artikel / gambar kategori)
 *   3. Default situs (Site Settings → Default OG Image)
 *
 * Semua URL relatif diresolusi ke absolut lewat `metadataBase` di root layout.
 *
 * Dua bahasa: `path` yang dioper pemanggil SELALU path netral tanpa prefix
 * (mis. "/produk"). Fungsi ini yang menambahkan prefix locale untuk canonical
 * dan menyusun `alternates.languages` (hreflang) agar Google tahu kedua versi
 * adalah terjemahan satu sama lain, bukan konten duplikat.
 */

import type { Metadata } from "next";
import { getSiteSettings, resolveMediaUrl } from "@/lib/queries";
import { defaultLocale, localePath, locales, ogLocale, type Locale } from "@/lib/i18n";

export interface BuildMetadataArgs {
  title: string;
  description?: string;
  /** Path kanonik TANPA prefix locale, mis. "/produk" atau "/journal/slug" */
  path: string;
  /** URL gambar OG (sudah varian 1200×630 bila dari media) */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  /** Bahasa halaman. Default ke Bahasa Indonesia bila tidak dioper. */
  locale?: Locale;
}

/** Peta hreflang untuk sebuah path netral, plus x-default ke bahasa utama. */
export function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of locales) map[l] = localePath(l, path);
  map["x-default"] = localePath(defaultLocale, path);
  return map;
}

export async function buildMetadata(args: BuildMetadataArgs): Promise<Metadata> {
  const locale = args.locale ?? defaultLocale;
  const settings = await getSiteSettings(locale);
  const fallbackOg = resolveMediaUrl(settings?.defaultOgImage, "og");
  const image = args.image || fallbackOg || undefined;
  const siteName = settings?.siteName ?? "Noblekase";
  const canonical = localePath(locale, args.path);

  return {
    title: args.title,
    description: args.description,
    alternates: {
      canonical,
      languages: languageAlternates(args.path),
    },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      siteName,
      locale: ogLocale[locale],
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
