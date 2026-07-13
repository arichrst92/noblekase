/**
 * queries.ts — data-access layer Payload untuk frontend.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Mengembalikan bentuk data yang sama seperti sample-data.ts (Sample* types)
 * supaya komponen frontend tidak perlu diubah — cukup ganti sumber import.
 * Media di-resolve ke URL string; richText di-flatten ke plain text.
 */

import { getPayloadClient } from "@/lib/payload";
import type {
  SampleProduct,
  SampleCategory,
  SampleMarketplace,
} from "@/lib/sample-data";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Ambil URL media (opsional varian ukuran), fallback ke URL asli. */
function mediaUrl(m: unknown, size?: string): string {
  if (!m || typeof m !== "object") return "";
  const media = m as { url?: string; sizes?: Record<string, { url?: string }> };
  if (size && media.sizes?.[size]?.url) return media.sizes[size]!.url!;
  return media.url ?? "";
}

/** Flatten Lexical richText → plain text (paragraf dipisah newline ganda). */
function richTextToPlain(rt: unknown): string {
  const root = (rt as { root?: { children?: unknown[] } })?.root;
  if (!root?.children) return "";
  const walk = (nodes: unknown[]): string =>
    nodes
      .map((n) => {
        const node = n as { type?: string; text?: string; children?: unknown[] };
        if (node.type === "text") return node.text ?? "";
        return node.children ? walk(node.children) : "";
      })
      .join("");
  return (root.children as { children?: unknown[] }[])
    .map((n) => walk(n.children ?? []))
    .join("\n\n")
    .trim();
}

const badgeOut: Record<string, "NEW" | "BEST" | "PRO"> = {
  new: "NEW",
  "best-seller": "BEST",
  limited: "PRO",
};

// ------------------------------------------------------------------
// Mappers
// ------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(p: any): SampleProduct {
  const sub = p.subCategory && typeof p.subCategory === "object" ? p.subCategory : null;
  const cat = sub?.category && typeof sub.category === "object" ? sub.category : null;

  const galleryItems: any[] = Array.isArray(p.gallery) ? p.gallery : [];
  const gallery = galleryItems
    .filter((g) => g.type !== "lifestyle")
    .map((g) => mediaUrl(g.image))
    .filter(Boolean);
  const lifestyle = galleryItems
    .filter((g) => g.type === "lifestyle")
    .map((g) => mediaUrl(g.image))
    .filter(Boolean);

  const imageUrl = mediaUrl(p.mainImage, "square");

  const marketplaces: SampleMarketplace[] = (p.marketplaceLinks ?? []).map((l: any) => {
    const mp = l.marketplace && typeof l.marketplace === "object" ? l.marketplace : null;
    const benefit = String(l.benefitLabel ?? "").toLowerCase();
    const badge = l.isPrimary
      ? ("best-price" as const)
      : benefit.includes("cepat") || benefit.includes("ship")
        ? ("fast-ship" as const)
        : benefit.includes("baru") || benefit.includes("new")
          ? ("new" as const)
          : undefined;
    return { key: mp?.slug ?? "", name: mp?.name ?? "", url: l.url ?? "", badge };
  });

  const related: string[] = (p.relatedProducts ?? [])
    .map((r: any) => (r && typeof r === "object" ? r.slug : null))
    .filter(Boolean);

  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? "",
    categorySlug: cat?.slug ?? "",
    category: cat?.name ?? "",
    imageUrl,
    gallery: gallery.length ? gallery : [imageUrl].filter(Boolean),
    lifestyle,
    badge: p.badge ? badgeOut[p.badge] : undefined,
    story: richTextToPlain(p.storyBody),
    specs: (p.specs ?? []).map((s: any) => ({ label: s.label, value: s.value })),
    marketplaces,
    related,
  } as SampleProduct;
}

// ------------------------------------------------------------------
// Products
// ------------------------------------------------------------------

export async function getProducts(): Promise<SampleProduct[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "products",
    where: { status: { equals: "published" } },
    depth: 2,
    limit: 200,
    sort: "order",
  });
  return res.docs.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<SampleProduct | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "products",
    where: { slug: { equals: slug }, status: { equals: "published" } },
    depth: 2,
    limit: 1,
  });
  return res.docs[0] ? mapProduct(res.docs[0]) : null;
}

export async function getProductsByCategorySlug(slug: string): Promise<SampleProduct[]> {
  const all = await getProducts();
  return all.filter((p) => p.categorySlug === slug);
}

export async function getRelatedProducts(product: SampleProduct): Promise<SampleProduct[]> {
  if (product.related?.length) {
    const all = await getProducts();
    const bySlug = new Map(all.map((p) => [p.slug, p]));
    const rel = product.related
      .map((s) => bySlug.get(s))
      .filter((p): p is SampleProduct => Boolean(p));
    if (rel.length) return rel.slice(0, 3);
  }
  const same = (await getProductsByCategorySlug(product.categorySlug)).filter(
    (p) => p.slug !== product.slug,
  );
  return same.slice(0, 3);
}

// ------------------------------------------------------------------
// Categories
// ------------------------------------------------------------------

export async function getCategories(): Promise<SampleCategory[]> {
  const payload = await getPayloadClient();
  const [cats, prods] = await Promise.all([
    payload.find({
      collection: "categories",
      where: { status: { equals: "published" } },
      depth: 1,
      sort: "order",
      limit: 50,
    }),
    getProducts(),
  ]);
  return cats.docs.map((c: any) => ({
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    productCount: prods.filter((p) => p.categorySlug === c.slug).length,
    imageUrl: mediaUrl(c.image, "landscape"),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<SampleCategory | null> {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

// ------------------------------------------------------------------
// Hero & Featured (Beranda)
// ------------------------------------------------------------------

export interface HeroData {
  eyebrow: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
}

export async function getActiveHero(): Promise<HeroData | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "hero-editions",
    where: { isActive: { equals: true } },
    depth: 1,
    limit: 1,
  });
  const h: any = res.docs[0];
  if (!h) return null;
  return {
    eyebrow: h.eyebrow ?? "",
    headline: h.headline,
    subheadline: h.subheadline ?? "",
    imageUrl: mediaUrl(h.image, "wide"),
    imageAlt: (typeof h.image === "object" ? h.image?.alt : "") || h.headline,
    ctaLabel: h.ctaLabel ?? "Jelajahi produk",
    ctaUrl: h.ctaUrl ?? "/produk",
  };
}

export interface FeaturedCard {
  name: string;
  slug: string;
  imageUrl: string;
}
export interface FeaturedData {
  eyebrow: string;
  headline: string;
  subheadline: string;
  mainProduct: FeaturedCard;
  secondaryProducts: FeaturedCard[];
}

export async function getActiveFeatured(): Promise<FeaturedData | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "featured-collections",
    where: { isActive: { equals: true } },
    depth: 2,
    limit: 1,
  });
  const f: any = res.docs[0];
  const toCard = (p: any): FeaturedCard | null =>
    p && typeof p === "object"
      ? { name: p.name, slug: p.slug, imageUrl: mediaUrl(p.mainImage, "square") }
      : null;
  const main = toCard(f?.mainProduct);
  if (!main) return null;
  const secondaryProducts = (f.secondaryProducts ?? [])
    .map(toCard)
    .filter((c: FeaturedCard | null): c is FeaturedCard => Boolean(c));
  return {
    eyebrow: f.eyebrow ?? "",
    headline: f.headline,
    subheadline: f.subheadline ?? "",
    mainProduct: main,
    secondaryProducts,
  };
}
