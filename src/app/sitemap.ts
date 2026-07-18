/**
 * sitemap.xml — dihasilkan dari konten CMS.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Disajikan Next di /sitemap.xml. robots.txt sudah menunjuk ke sini.
 * Gagal-aman: bila database tidak terjangkau saat build, sitemap tetap
 * terbit berisi halaman statis (build tidak ikut gagal).
 *
 * Dua bahasa: setiap URL didaftarkan untuk SEMUA locale, dan tiap entri
 * membawa `alternates.languages` (hreflang). Ini yang memberi tahu Google
 * bahwa /produk dan /en/produk adalah terjemahan satu sama lain, bukan
 * konten duplikat — sekaligus membuat versi Inggris ikut terindeks.
 *
 * Slug produk/artikel diambil sekali dari bahasa default saja. Slug memang
 * sengaja tidak diterjemahkan supaya satu produk punya alamat yang sama di
 * kedua bahasa, jadi tidak perlu query ulang per locale.
 */

import type { MetadataRoute } from "next";
import { getProducts, getCategories, getArticles } from "@/lib/queries";
import { defaultLocale, localePath, locales } from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const abs = (path: string) => `${SITE.replace(/\/$/, "")}${path}`;

export const revalidate = 3600; // segarkan tiap jam

type Entry = MetadataRoute.Sitemap[number];

/** Kembangkan satu path netral menjadi satu entri per bahasa. */
function expand(
  path: string,
  opts: Omit<Entry, "url" | "alternates"> = {},
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, abs(p)]),
  );
  return locales.map((locale) => ({
    ...opts,
    url: abs(localePath(locale, path)),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    ...expand("/", { lastModified: now, changeFrequency: "weekly", priority: 1 }),
    ...expand("/produk", { lastModified: now, changeFrequency: "weekly", priority: 0.9 }),
    ...expand("/journal", { lastModified: now, changeFrequency: "weekly", priority: 0.7 }),
    ...expand("/tentang", { lastModified: now, changeFrequency: "monthly", priority: 0.5 }),
    ...expand("/dukungan", { lastModified: now, changeFrequency: "monthly", priority: 0.5 }),
  ];

  try {
    const [products, categories, articles] = await Promise.all([
      getProducts(defaultLocale),
      getCategories(defaultLocale),
      getArticles(defaultLocale),
    ]);

    const categoryEntries = categories.flatMap((c) =>
      expand(`/produk/${c.slug}`, {
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const productEntries = products.flatMap((p) =>
      expand(`/produk/detail/${p.slug}`, {
        lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const articleEntries = articles.flatMap((a) =>
      expand(`/journal/${a.slug}`, {
        lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    );

    return [...staticEntries, ...categoryEntries, ...productEntries, ...articleEntries];
  } catch {
    return staticEntries;
  }
}
