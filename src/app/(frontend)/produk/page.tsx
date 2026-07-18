/**
 * /produk — Listing semua produk dengan filter kategori sidebar.
 */

import type { Metadata } from "next";
import { SmartImage as Image } from "@/components/media/SmartImage";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilterSidebar } from "@/components/sections/ProductFilterSidebar";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { SortSelect } from "@/components/sections/SortSelect";
import {
  getProducts,
  getCategories,
  getSubCategories,
  getGlobalData,
  resolveMediaUrl,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { applyFilters, parseFilters } from "@/lib/productFilters";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getGlobalData("page-products");
  return buildMetadata({
    title: t?.headline ?? "Produk",
    description:
      t?.intro ??
      "Jelajahi koleksi aksesoris Noblekase: charger GaN, kabel, holder, audio, dan casing.",
    path: "/produk",
    image: resolveMediaUrl(t?.bannerImage, "og") || undefined,
  });
}

interface ProductListingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductListingPage({ searchParams }: ProductListingPageProps) {
  const [allProducts, categories, subCategories, t, sp] = await Promise.all([
    getProducts(),
    getCategories(),
    getSubCategories(),
    getGlobalData("page-products"),
    searchParams,
  ]);

  const filters = parseFilters(sp);
  const products = applyFilters(allProducts, filters);

  // Hitungan per filter dihitung dari seluruh produk (bukan hasil terfilter),
  // supaya angka di sidebar tetap informatif saat filter aktif.
  const subCounts = allProducts.reduce<Record<string, number>>((acc, p) => {
    if (p.subCategorySlug) acc[p.subCategorySlug] = (acc[p.subCategorySlug] ?? 0) + 1;
    return acc;
  }, {});
  const badgeCounts = allProducts.reduce<Record<string, number>>((acc, p) => {
    if (p.badge) acc[p.badge] = (acc[p.badge] ?? 0) + 1;
    return acc;
  }, {});
  const bannerUrl =
    resolveMediaUrl(t?.bannerImage, "landscape") || "/images/hero/produk-listing-banner.svg";

  return (
    <>
      <RevealOnScroll />

      {/* Header banner */}
      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-14 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">{t?.eyebrow ?? "Koleksi"}</div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
                {t?.headline ?? "Semua produk Noblekase"}
              </h1>
              <p className="text-base text-ink-secondary leading-relaxed max-w-md">
                {t?.intro ??
                  "Empat kategori yang menemani hari-hari Anda. Harga ada di marketplace pilihan — kami menjaga koleksi & konsistensi kualitas."}
              </p>
            </div>
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-md overflow-hidden relative">
              <Image
                src={bannerUrl}
                alt={t?.headline ?? "Noblekase produk"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Listing */}
      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-10">
            <ProductFilterSidebar
              totalCount={allProducts.length}
              categories={categories}
              subCategories={subCategories}
              filters={filters}
              basePath="/produk"
              subCounts={subCounts}
              badgeCounts={badgeCounts}
              marketplaceNote={t?.filterDisclaimer ?? undefined}
            />

            <div>
              <div className="flex items-center justify-between gap-4 mb-5 md:mb-6">
                <div className="text-sm text-ink-secondary">
                  Menampilkan{" "}
                  <span className="text-ink-primary font-medium">{products.length}</span>{" "}
                  dari {allProducts.length} produk
                </div>
                <SortSelect basePath="/produk" filters={filters} />
              </div>

              {products.length === 0 && (
                <p className="text-sm text-ink-secondary py-10">
                  Tidak ada produk yang cocok dengan filter ini.
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {products.map((p) => (
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
