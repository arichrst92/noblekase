/**
 * /produk/[category] — Listing produk per kategori.
 * Mis: /produk/charger-power, /produk/kabel-konektor, /produk/holder-stand,
 *      /produk/audio-casing
 */

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilterSidebar } from "@/components/sections/ProductFilterSidebar";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategorySlug,
} from "@/lib/queries";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Kategori tidak ditemukan" };
  return {
    title: `${cat.name}`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const [cat, categories] = await Promise.all([
    getCategoryBySlug(category),
    getCategories(),
  ]);
  if (!cat) notFound();

  const items = await getProductsByCategorySlug(category);
  const totalCount = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <>
      <RevealOnScroll />

      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-14 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">Kategori</div>
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
            />

            <div>
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <div className="text-sm text-ink-secondary">
                  Menampilkan{" "}
                  <span className="text-ink-primary font-medium">
                    {items.length}
                  </span>{" "}
                  produk di {cat.name}
                </div>
              </div>

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
