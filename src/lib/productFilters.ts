/**
 * productFilters.ts — filter & sorting produk berbasis URL query params.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan: Noblekase tidak menampilkan harga (pembelian lewat marketplace),
 * jadi tidak ada filter/sort harga. Yang tersedia: sub-kategori, badge, dan
 * urutan nama/terbaru.
 */

import type { ProductWithSeo } from "@/lib/queries";

export type SortKey = "terbaru" | "nama" | "default";

export interface ProductFilters {
  sub?: string;
  badge?: string;
  sort?: SortKey;
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Urutan pilihan" },
  { value: "terbaru", label: "Terbaru" },
  { value: "nama", label: "Nama A–Z" },
];

export const BADGE_OPTIONS: { value: string; label: string }[] = [
  { value: "NEW", label: "Baru" },
  { value: "BEST", label: "Terlaris" },
  { value: "PRO", label: "Pro" },
];

/** Baca filter dari searchParams (aman terhadap nilai tak dikenal). */
export function parseFilters(sp: Record<string, string | string[] | undefined>): ProductFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const sort = one(sp.sort) as SortKey | undefined;
  return {
    sub: one(sp.sub) || undefined,
    badge: one(sp.badge) || undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "default",
  };
}

export function applyFilters(
  products: ProductWithSeo[],
  { sub, badge, sort }: ProductFilters,
): ProductWithSeo[] {
  let out = products;
  if (sub) out = out.filter((p) => p.subCategorySlug === sub);
  if (badge) out = out.filter((p) => p.badge === badge);

  if (sort === "nama") {
    out = [...out].sort((a, b) => a.name.localeCompare(b.name, "id"));
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
