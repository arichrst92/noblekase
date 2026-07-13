/**
 * FeaturedCollection — magazine-style asymmetric grid
 * 1 produk besar + 2 produk kecil dengan reveal cinematic.
 */

import Image from "next/image";
import Link from "next/link";

interface FeaturedProduct {
  name: string;
  slug: string;
  imageUrl?: string;
}

interface FeaturedCollectionProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  mainProduct: FeaturedProduct;
  secondaryProducts: [FeaturedProduct, FeaturedProduct];
}

export function FeaturedCollection({
  eyebrow = "Cerita Edisi Ini",
  headline = "Untuk Pekerja Mobile",
  subheadline = "Koleksi pilihan untuk teman bekerja di mana saja",
  mainProduct,
  secondaryProducts,
}: FeaturedCollectionProps) {
  return (
    <section className="py-16 md:py-24 border-b border-border-light">
      <div className="container-prose">
        <div className="reveal mb-6 md:mb-8">
          <div className="eyebrow mb-2">{eyebrow}</div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-1.5">{headline}</h2>
          <p className="text-sm text-ink-secondary">{subheadline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3">
          {/* Main featured */}
          <Link
            href={`/produk/detail/${mainProduct.slug}`}
            className="reveal aspect-[5/4] md:aspect-[1.2/1] bg-bg-warm border border-border-mid rounded-md overflow-hidden relative hover-zoom group"
          >
            {mainProduct.imageUrl ? (
              <Image
                src={mainProduct.imageUrl}
                alt={mainProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-ink-tertiary text-sm">
                <span>Featured product</span>
                <span className="text-xs mt-1">{mainProduct.name}</span>
              </div>
            )}
          </Link>

          {/* Secondary 1 */}
          <div className="grid grid-rows-2 gap-3">
            {secondaryProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/produk/detail/${p.slug}`}
                className="reveal bg-bg-warm border border-border-mid rounded-md overflow-hidden relative hover-zoom"
              >
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-ink-tertiary">
                    {p.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
