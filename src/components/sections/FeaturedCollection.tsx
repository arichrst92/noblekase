/**
 * FeaturedCollection — magazine-style asymmetric grid
 * 1 produk besar + 2 produk kecil dengan reveal cinematic.
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

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
  /**
   * Idealnya dua produk pendamping, tapi tipenya sengaja array biasa:
   * jumlah item datang dari CMS dan editor bisa saja mengisi kurang dari dua.
   * Tuple ketat membuat data CMS tidak pernah lolos typecheck.
   */
  secondaryProducts: FeaturedProduct[];
  locale?: Locale;
}

export function FeaturedCollection({
  eyebrow: eyebrowProp,
  headline: headlineProp,
  subheadline: subheadlineProp,
  mainProduct,
  secondaryProducts,
  locale = defaultLocale,
}: FeaturedCollectionProps) {
  const tr = translator(locale);
  // Fallback mengikuti bahasa aktif ketika field CMS masih kosong.
  const eyebrow = eyebrowProp ?? tr("featured.eyebrow");
  const headline = headlineProp ?? tr("featured.headline");
  const subheadline = subheadlineProp ?? tr("featured.subheadline");

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
            href={localePath(locale, `/produk/detail/${mainProduct.slug}`)}
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
                <span>{tr("featured.imagePlaceholder")}</span>
                <span className="text-xs mt-1">{mainProduct.name}</span>
              </div>
            )}
          </Link>

          {/* Secondary 1 */}
          <div className="grid grid-rows-2 gap-3">
            {secondaryProducts.map((p) => (
              <Link
                key={p.slug}
                href={localePath(locale, `/produk/detail/${p.slug}`)}
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
