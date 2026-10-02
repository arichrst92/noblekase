/**
 * ProductCard — kartu produk untuk listing & related.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Sprint 9: menampilkan harga + tombol "tambah ke keranjang".
 *
 * Struktur sengaja TIDAK lagi membungkus seluruh kartu dalam satu <Link>:
 * tombol keranjang adalah elemen interaktif, dan tombol di dalam link akan
 * ikut memicu navigasi saat diklik. Jadi hanya area gambar + teks yang jadi
 * tautan; harga & tombol berada di luar tautan.
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { defaultLocale, localePath, type Locale } from "@/lib/i18n";
import { formatRupiah } from "@/lib/format";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

interface ProductCardProps {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  badge?: "NEW" | "BEST" | "PRO";
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  weightGrams?: number;
  locale?: Locale;
}

export function ProductCard({
  slug,
  name,
  tagline,
  category,
  imageUrl,
  badge,
  price,
  compareAtPrice,
  stock,
  weightGrams,
  locale = defaultLocale,
}: ProductCardProps) {
  const hasPrice = typeof price === "number" && price > 0;
  const hasCompare =
    typeof compareAtPrice === "number" && hasPrice && compareAtPrice > price!;

  return (
    <div className="reveal group block border border-border-light rounded-lg overflow-hidden bg-bg-base hover:border-border-mid transition-colors">
      <Link
        href={localePath(locale, `/produk/detail/${slug}`)}
        className="block"
      >
        <div className="relative aspect-[4/3] bg-bg-warm overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          {badge && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider rounded-sm bg-ink-primary text-bg-base">
              {badge}
            </span>
          )}
        </div>
        <div className="px-3.5 pt-3.5 md:px-4 md:pt-4">
          <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-1.5">
            {category}
          </div>
          <h3 className="font-serif text-sm md:text-base font-medium leading-snug mb-1 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <p className="text-[12px] md:text-xs text-ink-secondary line-clamp-2">
            {tagline}
          </p>
        </div>
      </Link>

      <div className="px-3.5 pb-3.5 md:px-4 md:pb-4 pt-2.5">
        {hasPrice && (
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-sm md:text-base font-medium text-ink-primary">
              {formatRupiah(price!)}
            </span>
            {hasCompare && (
              <span className="text-xs text-ink-tertiary line-through">
                {formatRupiah(compareAtPrice!)}
              </span>
            )}
          </div>
        )}
        <AddToCartButton
          slug={slug}
          name={name}
          price={price}
          imageUrl={imageUrl}
          weightGrams={weightGrams}
          stock={stock}
          locale={locale}
          variant="compact"
        />
      </div>
    </div>
  );
}
