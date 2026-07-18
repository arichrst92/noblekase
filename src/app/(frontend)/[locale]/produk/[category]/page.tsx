/**
 * /produk/[category] — Listing produk per kategori.
 * Mis: /produk/charger-power, /produk/kabel-konektor, /produk/holder-stand,
 *      /produk/audio-casing
 */

import type { Metadata } from "next";
import { SmartImage as Image } from "@/components/media/SmartImage";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilterSidebar } from "@/components/sections/ProductFilterSidebar";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { SortSelect } from "@/components/sections/SortSelect";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
  getSubCategories,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { applyFilters, parseFilters } from "@/lib/productFilters";
import {
  defaultLocale,
  isLocale,
  localePath,
  locales,
  translator,
  type Locale,
} from "@/lib/i18n";

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Setiap kategori diprerender untuk kedua bahasa. */
export async function generateStaticParams() {
  try {
    const out: { locale: string; category: string }[] = [];
    for (const locale of locales) {
      const categories = await getCategories(locale);
      for (const c of categories) out.push({ locale, category: c.slug });
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale: raw, category } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const cat = await getCategoryBySlug(category, locale);
  if (!cat) return { title: translator(locale)("category.notFoundTitle") };
  return buildMetadata({
    title: cat.seoTitle ?? cat.name,
    description: cat.seoDescription ?? cat.description,
    path: `/produk/${category}`,
    image: cat.ogUrl,
    locale,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale: raw, category } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);

  const [cat, categories, subCategories, sp] = await Promise.all([
    getCategoryBySlug(category, locale),
    getCategories(locale),
    getSubCategories(locale),
    searchParams,
  ]);
  if (!cat) notFound();

  const allInCategory = await getProductsByCategorySlug(category, locale);
  const filters = parseFilters(sp);
  const items = applyFilters(allInCategory, filters);
  const totalCount = categories.reduce((sum, c) => sum + c.productCount, 0);
  const basePath = localePath(locale, `/produk/${category}`);

  // Sama seperti listing utama: angka "ditampilkan" tetap ditebalkan, jadi
  // templat kamus dipecah dulu di sekitar {shown}.
  const [showingBefore, showingAfter] = tr("category.showingCount", {
    total: allInCategory.length,
    category: cat.name,
  }).split("{shown}");

  const subCounts = allInCategory.reduce<Record<string, number>>((acc, p) => {
    if (p.subCategorySlug) acc[p.subCategorySlug] = (acc[p.subCategorySlug] ?? 0) + 1;
    return acc;
  }, {});
  const badgeCounts = allInCategory.reduce<Record<string, number>>((acc, p) => {
    if (p.badge) acc[p.badge] = (acc[p.badge] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <RevealOnScroll />

      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-14 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">{tr("category.eyebrow")}</div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
                {cat.name}
              </h1>
              <p className="text-base text-ink-secondary leading-relaxed max-w-md">
                {cat.description}
              </p>
            </div>
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-md overflow-hidden relative">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10">
            <ProductFilterSidebar
              activeCategory={category}
              totalCount={totalCount}
              categories={categories}
              subCategories={subCategories}
              filters={filters}
              basePath={basePath}
              subCounts={subCounts}
              badgeCounts={badgeCounts}
              locale={locale}
            />

            <div>
              <div className="flex items-center justify-between gap-4 mb-5 md:mb-6">
                <div className="text-sm text-ink-secondary">
                  {showingBefore}
                  <span className="text-ink-primary font-medium">{items.length}</span>
                  {showingAfter}
                </div>
                <SortSelect basePath={basePath} filters={filters} locale={locale} />
              </div>

              {items.length === 0 && (
                <p className="text-sm text-ink-secondary py-10">
                  {tr("products.noMatchFilter")}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {items.map((p) => (
                  <ProductCard
                    key={p.slug}
                    slug={p.slug}
                    name={p.name}
                    tagline={p.tagline}
                    category={p.category}
                    imageUrl={p.imageUrl}
                    badge={p.badge}
                    marketplaceKeys={p.marketplaces.map((m) => m.key)}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
