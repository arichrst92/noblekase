/**
 * SortSelect — pemilih urutan produk; mengubah query param `sort`.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

"use client";

import { useRouter } from "next/navigation";
import { getSortOptions, buildFilterUrl, type ProductFilters, type SortKey } from "@/lib/productFilters";
import { defaultLocale, localePath, stripLocale, translator, type Locale } from "@/lib/i18n";

export function SortSelect({
  basePath,
  filters,
  locale = defaultLocale,
}: {
  basePath: string;
  filters: ProductFilters;
  locale?: Locale;
}) {
  const router = useRouter();
  const tr = translator(locale);
  const sortOptions = getSortOptions(locale);
  // stripLocale dulu supaya aman kalau pemanggil sudah mengoper path ber-prefix.
  const base = localePath(locale, stripLocale(basePath).path);

  return (
    <label className="flex items-center gap-2 text-sm text-ink-secondary">
      <span className="hidden sm:inline">{tr("sort.label")}</span>
      <select
        value={filters.sort ?? "default"}
        onChange={(e) =>
          router.push(buildFilterUrl(base, filters, { sort: e.target.value as SortKey }))
        }
        aria-label={tr("sort.ariaLabel")}
        className="border border-border-mid rounded-full px-3 py-1.5 text-sm bg-bg-base focus:outline-none focus:border-ink-primary transition-colors"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
