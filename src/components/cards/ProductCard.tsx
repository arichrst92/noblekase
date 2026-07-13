/**
 * ProductCard — kartu produk untuk listing & related
 * Tidak menampilkan harga (per keputusan brand: harga ada di marketplace).
 */

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  imageUrl: string;
  badge?: "NEW" | "BEST" | "PRO";
  marketplaceKeys?: string[];
}

export function ProductCard({
  slug,
  name,
  tagline,
  category,
  imageUrl,
  badge,
  marketplaceKeys = [],
}: ProductCardProps) {
  return (
    <Link
      href={`/produk/detail/${slug}`}
      className="reveal group block border border-border-light rounded-lg overflow-hidden bg-bg-base hover:border-border-mid transition-colors"
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
      <div className="p-3.5 md:p-4">
        <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-1.5">
          {category}
        </div>
        <h3 className="font-serif text-sm md:text-base font-medium leading-snug mb-1 group-hover:text-accent transition-colors">
          {name}
        </h3>
        <p className="text-[12px] md:text-xs text-ink-secondary line-clamp-2">
          {tagline}
        </p>
        {marketplaceKeys.length > 0 && (
          <div className="flex gap-1.5 mt-3">
            {marketplaceKeys.slice(0, 4).map((k) => (
              <span
                key={k}
                title={k}
                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-bg-warm text-ink-tertiary"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
