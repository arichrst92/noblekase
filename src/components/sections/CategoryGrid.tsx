/**
 * CategoryGrid — 4 kartu kategori dengan grid 2x2 (mobile) atau 4-kolom (desktop)
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

interface Category {
  name: string;
  slug: string;
  productCount: number;
  imageUrl?: string;
}

interface CategoryGridProps {
  categories?: Category[];
  eyebrow?: string;
  headline?: string;
  locale?: Locale;
}

const defaultCategories: Category[] = [
  { name: "Charger & Power", slug: "charger-power", productCount: 12 },
  { name: "Kabel & Konektor", slug: "kabel-konektor", productCount: 9 },
  { name: "Holder & Stand", slug: "holder-stand", productCount: 7 },
  { name: "Audio & Casing", slug: "audio-casing", productCount: 15 },
];

export function CategoryGrid({
  categories = defaultCategories,
  eyebrow: eyebrowProp,
  headline: headlineProp,
  locale = defaultLocale,
}: CategoryGridProps) {
  const tr = translator(locale);
  // Fallback mengikuti bahasa aktif ketika field CMS masih kosong.
  const eyebrow = eyebrowProp ?? tr("categoryGrid.eyebrow");
  const headline = headlineProp ?? tr("categoryGrid.headline");

  return (
    <section className="py-16 md:py-24 border-b border-border-light">
      <div className="container-prose">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div className="reveal">
            <div className="eyebrow mb-2">{eyebrow}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium">{headline}</h2>
          </div>
          <Link
            href={localePath(locale, "/produk")}
            className="text-sm text-ink-secondary hover:text-ink-primary"
          >
            {tr("common.viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={localePath(locale, `/produk/${cat.slug}`)}
              className="reveal group border border-border-light rounded-lg p-3 md:p-4 text-center hover:border-border-mid transition-colors"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="aspect-square bg-bg-warm rounded-md overflow-hidden mb-3 hover-zoom">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-ink-tertiary">
                    {tr("common.imagePlaceholder")}
                  </div>
                )}
              </div>
              <div className="text-xs md:text-sm font-medium">{cat.name}</div>
              <div className="text-[10px] md:text-xs text-ink-secondary">
                {cat.productCount} {tr("common.productsSuffix")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
