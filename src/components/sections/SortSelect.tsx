/**
 * SortSelect — pemilih urutan produk; mengubah query param `sort`.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, buildFilterUrl, type ProductFilters, type SortKey } from "@/lib/productFilters";

export function SortSelect({
  basePath,
  filters,
}: {
  basePath: string;
  filters: ProductFilters;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-ink-secondary">
      <span className="hidden sm:inline">Urutkan</span>
      <select
        value={filters.sort ?? "default"}
        onChange={(e) =>
          router.push(buildFilterUrl(basePath, filters, { sort: e.target.value as SortKey }))
        }
        aria-label="Urutkan produk"
        className="border border-border-mid rounded-full px-3 py-1.5 text-sm bg-bg-base focus:outline-none focus:border-ink-primary transition-colors"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
