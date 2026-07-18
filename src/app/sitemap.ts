/**
 * sitemap.xml — dihasilkan dari konten CMS.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Disajikan Next di /sitemap.xml. robots.txt sudah menunjuk ke sini.
 * Gagal-aman: bila database tidak terjangkau saat build, sitemap tetap
 * terbit berisi halaman statis (build tidak ikut gagal).
 */

import type { MetadataRoute } from "next";
import { getProducts, getCategories, getArticles } from "@/lib/queries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const abs = (path: string) => `${SITE.replace(/\/$/, "")}${path}`;

export const revalidate = 3600; // segarkan tiap jam

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: abs("/produk"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: abs("/journal"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/tentang"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: abs("/dukungan"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [products, categories, articles] = await Promise.all([
      getProducts(),
      getCategories(),
      getArticles(),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: abs(`/produk/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: abs(`/produk/detail/${p.slug}`),
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: abs(`/journal/${a.slug}`),
      lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...staticEntries, ...categoryEntries, ...productEntries, ...articleEntries];
  } catch {
    return staticEntries;
  }
}
