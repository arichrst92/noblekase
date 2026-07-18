/**
 * ProductTabs — grid produk dengan tab (Terbaru / Terlaris / Semua).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan: Noblekase katalog (tanpa keranjang), jadi kartu produk mengarah ke
 * halaman detail; konversi terjadi lewat tombol marketplace di detail.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { cn } from "@/lib/cn";

export interface TabProduct {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  badge?: "NEW" | "BEST" | "PRO";
  marketplaceKeys: string[];
}

interface ProductTabsProps {
  products: TabProduct[];
  eyebrow?: string;
  headline?: string;
  labels?: { new: string; best: string; all: string };
  seeAllLabel?: string;
  limit?: number;
}

export function ProductTabs({
  products,
  eyebrow = "Koleksi",
  headline = "Pilihan untuk hari-hari Anda",
  labels = { new: "Terbaru", best: "Terlaris", all: "Semua" },
  seeAllLabel = "Lihat semua →",
  limit = 8,
}: ProductTabsProps) {
  const tabs = [
    { key: "new", label: labels.new, items: products.filter((p) => p.badge === "NEW") },
    { key: "best", label: labels.best, items: products.filter((p) => p.badge === "BEST") },
    { key: "all", label: labels.all, items: products },
  ].filter((t) => t.items.length > 0);

  const [active, setActive] = useState(tabs[0]?.key ?? "all");
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  if (!current) return null;

  return (
    <section className="py-14 md:py-20 border-b border-border-light">
      <div className="container-prose">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
          <div className="reveal">
            <div className="eyebrow mb-2">{eyebrow}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium">{headline}</h2>
          </div>
          <Link href="/produk" className="text-sm text-ink-secondary hover:text-ink-primary shrink-0">
            {seeAllLabel}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 md:mb-8 overflow-x-auto pb-1" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={active === t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border",
                active === t.key
                  ? "bg-ink-primary text-bg-base border-ink-primary font-medium"
                  : "bg-bg-base text-ink-secondary border-border-mid hover:border-ink-primary",
              )}
            >
              {t.label}
              <span className="ml-1.5 text-[11px] opacity-60">{t.items.length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {current.items.slice(0, limit).map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              name={p.name}
              tagline={p.tagline}
              category={p.category}
              imageUrl={p.imageUrl}
              badge={p.badge}
              marketplaceKeys={p.marketplaceKeys}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
