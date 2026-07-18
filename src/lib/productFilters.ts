/**
 * productFilters.ts — filter & sorting produk berbasis URL query params.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan: Noblekase tidak menampilkan harga (pembelian lewat marketplace),
 * jadi tidak ada filter/sort harga. Yang tersedia: sub-kategori, badge, dan
 * urutan nama/terbaru.
 */

import type { ProductWithSeo } from "@/lib/queries";
import { defaultLocale, htmlLang, t, type Locale } from "@/lib/i18n";

export type SortKey = "terbaru" | "nama" | "default";

export interface ProductFilters {
  sub?: string;
  badge?: string;
  sort?: SortKey;
}

export interface SortOption {
  value: SortKey;
  label: string;
}
export interface BadgeOption {
  value: string;
  label: string;
}

/**
 * Daftar nilai teknis, terpisah dari labelnya. Nilai inilah yang muncul di
 * URL query param, jadi tidak boleh ikut berubah saat bahasa berganti.
 */
const SORT_KEYS: SortKey[] = ["default", "terbaru", "nama"];

/** Pilihan urutan beserta labelnya dalam bahasa aktif. */
export function getSortOptions(locale: Locale): SortOption[] {
  return [
    { value: "default", label: t(locale, "sort.option.default") },
    { value: "terbaru", label: t(locale, "sort.option.newest") },
    { value: "nama", label: t(locale, "sort.option.nameAsc") },
  ];
}

/** Pilihan badge beserta labelnya dalam bahasa aktif (nilai NEW/BEST/PRO tetap). */
export function getBadgeOptions(locale: Locale): BadgeOption[] {
  return [
    { value: "NEW", label: t(locale, "badge.new") },
    { value: "BEST", label: t(locale, "badge.best") },
    { value: "PRO", label: t(locale, "badge.pro") },
  ];
}

/** Baca filter dari searchParams (aman terhadap nilai tak dikenal). */
export function parseFilters(sp: Record<string, string | string[] | undefined>): ProductFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const sort = one(sp.sort) as SortKey | undefined;
  return {
    sub: one(sp.sub) || undefined,
    badge: one(sp.badge) || undefined,
    sort: sort && SORT_KEYS.includes(sort) ? sort : "default",
  };
}

export function applyFilters(
  products: ProductWithSeo[],
  { sub, badge, sort }: ProductFilters,
  locale: Locale = defaultLocale,
): ProductWithSeo[] {
  // Collator ikut bahasa aktif — urutan A–Z bahasa Inggris dan Indonesia
  // menangani tanda baca serta huruf beraksen dengan aturan berbeda.
  const collator = htmlLang[locale];
  let out = products;
  if (sub) out = out.filter((p) => p.subCategorySlug === sub);
  if (badge) out = out.filter((p) => p.badge === badge);

  if (sort === "nama") {
    out = [...out].sort((a, b) => a.name.localeCompare(b.name, collator));
  } else if (sort === "terbaru") {
    out = [...out].sort(
      (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
    );
  }
  return out;
}

/** Bangun URL dengan satu parameter diubah (nilai kosong = hapus param). */
export function buildFilterUrl(
  basePath: string,
  current: ProductFilters,
  change: Partial<ProductFilters>,
): string {
  const merged = { ...current, ...change };
  const params = new URLSearchParams();
  if (merged.sub) params.set("sub", merged.sub);
  if (merged.badge) params.set("badge", merged.badge);
  if (merged.sort && merged.sort !== "default") params.set("sort", merged.sort);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function hasActiveFilters(f: ProductFilters): boolean {
  return Boolean(f.sub || f.badge || (f.sort && f.sort !== "default"));
}
