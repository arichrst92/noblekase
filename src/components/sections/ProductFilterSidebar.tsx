/**
 * ProductFilterSidebar — filter kategori, sub-kategori, dan badge.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Semua filter berupa <Link> yang mengubah query params, sehingga:
 *  - tetap berfungsi tanpa JavaScript,
 *  - URL-nya bisa dibagikan / di-bookmark,
 *  - server component (tidak menambah bundle client).
 */

import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  BADGE_OPTIONS,
  buildFilterUrl,
  hasActiveFilters,
  type ProductFilters,
} from "@/lib/productFilters";

interface FilterCategory {
  slug: string;
  name: string;
  productCount: number;
}
interface FilterSubCategory {
  slug: string;
  name: string;
  categorySlug: string;
}

interface ProductFilterSidebarProps {
  activeCategory?: string;
  totalCount: number;
  categories?: FilterCategory[];
  subCategories?: FilterSubCategory[];
  filters?: ProductFilters;
  /** Path dasar untuk link filter, mis. "/produk" atau "/produk/charger-power" */
  basePath?: string;
  /** Jumlah produk per sub-kategori & badge pada hasil saat ini */
  subCounts?: Record<string, number>;
  badgeCounts?: Record<string, number>;
  marketplaceNote?: string;
}

export function ProductFilterSidebar({
  activeCategory,
  totalCount,
  categories = [],
  subCategories = [],
  filters = {},
  basePath = "/produk",
  subCounts = {},
  badgeCounts = {},
  marketplaceNote = "Harga ditampilkan di setiap marketplace. Kami menyatukan koleksi — marketplace yang memutuskan promo & ongkos kirim.",
}: ProductFilterSidebarProps) {
  // Sub-kategori dibatasi ke kategori aktif bila sedang di halaman kategori
  const subs = activeCategory
    ? subCategories.filter((s) => s.categorySlug === activeCategory)
    : subCategories;

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center justify-between py-1.5 px-2 -mx-2 rounded transition-colors",
      active
        ? "bg-bg-warm text-ink-primary font-medium"
        : "text-ink-secondary hover:text-ink-primary",
    );

  return (
    <aside className="md:sticky md:top-28 md:self-start">
      <div className="bg-bg-base border border-border-light rounded-lg p-5 md:p-6">
        {/* Kategori */}
        <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
          Kategori
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link href="/produk" className={linkClass(!activeCategory)}>
              <span>Semua produk</span>
              <span className="text-[11px] text-ink-tertiary">{totalCount}</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link href={`/produk/${cat.slug}`} className={linkClass(activeCategory === cat.slug)}>
                <span>{cat.name}</span>
                <span className="text-[11px] text-ink-tertiary">{cat.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Sub-kategori */}
        {subs.length > 0 && (
          <div className="mt-6 pt-5 border-t border-border-light">
            <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
              Tipe
            </div>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href={buildFilterUrl(basePath, filters, { sub: undefined })}
                  className={linkClass(!filters.sub)}
                >
                  <span>Semua tipe</span>
                </Link>
              </li>
              {subs.map((s) => {
                const active = filters.sub === s.slug;
                return (
                  <li key={s.slug}>
                    <Link
                      href={buildFilterUrl(basePath, filters, {
                        sub: active ? undefined : s.slug,
                      })}
                      className={linkClass(active)}
                    >
                      <span>{s.name}</span>
                      <span className="text-[11px] text-ink-tertiary">
                        {subCounts[s.slug] ?? 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Badge */}
        <div className="mt-6 pt-5 border-t border-border-light">
          <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
            Label
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BADGE_OPTIONS.map((b) => {
              const active = filters.badge === b.value;
              const count = badgeCounts[b.value] ?? 0;
              if (!active && count === 0) return null;
              return (
                <Link
                  key={b.value}
                  href={buildFilterUrl(basePath, filters, {
                    badge: active ? undefined : b.value,
                  })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[12px] border transition-colors",
                    active
                      ? "bg-ink-primary text-bg-base border-ink-primary"
                      : "border-border-mid text-ink-secondary hover:border-ink-primary",
                  )}
                >
                  {b.label}
                  <span className="ml-1 opacity-60">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters(filters) && (
          <div className="mt-5">
            <Link
              href={basePath}
              className="text-[12px] text-accent hover:text-ink-primary underline underline-offset-2"
            >
              Reset filter
            </Link>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border-light text-[11px] text-ink-tertiary leading-relaxed">
          {marketplaceNote}
        </div>
      </div>
    </aside>
  );
}
