/**
 * ProductFilterSidebar — filter kategori untuk listing /produk
 *
 * Saat ini static (server component). Phase 2: tambah filter dinamis
 * (subkategori, badge, harga range) dengan client-side state.
 */

import Link from "next/link";
import { cn } from "@/lib/cn";

interface FilterCategory {
  slug: string;
  name: string;
  productCount: number;
}

interface ProductFilterSidebarProps {
  activeCategory?: string;
  totalCount: number;
  categories?: FilterCategory[];
}

export function ProductFilterSidebar({
  activeCategory,
  totalCount,
  categories = [],
}: ProductFilterSidebarProps) {
  return (
    <aside className="md:sticky md:top-28 md:self-start">
      <div className="bg-bg-base border border-border-light rounded-lg p-5 md:p-6">
        <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
          Kategori
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <Link
              href="/produk"
              className={cn(
                "flex items-center justify-between py-1.5 px-2 -mx-2 rounded transition-colors",
                !activeCategory
                  ? "bg-bg-warm text-ink-primary font-medium"
                  : "text-ink-secondary hover:text-ink-primary"
              )}
            >
              <span>Semua produk</span>
              <span className="text-[11px] text-ink-tertiary">{totalCount}</span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/produk/${cat.slug}`}
                className={cn(
                  "flex items-center justify-between py-1.5 px-2 -mx-2 rounded transition-colors",
                  activeCategory === cat.slug
                    ? "bg-bg-warm text-ink-primary font-medium"
                    : "text-ink-secondary hover:text-ink-primary"
                )}
              >
                <span>{cat.name}</span>
                <span className="text-[11px] text-ink-tertiary">
                  {cat.productCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-5 border-t border-border-light">
          <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
            Marketplace
          </div>
          <ul className="space-y-1 text-[12px] text-ink-secondary">
            <li>Tokopedia · Best Price</li>
            <li>Shopee · Fast Ship</li>
            <li>TikTok Shop</li>
            <li>Lazada</li>
          </ul>
        </div>

        <div className="mt-6 pt-5 border-t border-border-light text-[11px] text-ink-tertiary leading-relaxed">
          Harga ditampilkan di setiap marketplace. Kami menyatukan koleksi —
          marketplace yang memutuskan promo & ongkos kirim.
        </div>
      </div>
    </aside>
  );
}
