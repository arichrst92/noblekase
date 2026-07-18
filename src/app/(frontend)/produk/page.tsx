/**
 * /produk — Listing semua produk dengan filter kategori sidebar.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilterSidebar } from "@/components/sections/ProductFilterSidebar";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { getProducts, getCategories, getGlobalData, resolveMediaUrl } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

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

export default async function ProductListingPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <RevealOnScroll />

      {/* Header banner */}
      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-14 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-8 md:gap-12 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">Koleksi</div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
                Semua produk Noblekase
              </h1>
              <p className="text-base text-ink-secondary leading-relaxed max-w-md">
                Empat kategori yang menemani hari-hari Anda. Harga ada di
                marketplace pilihan — kami menjaga koleksi & konsistensi
                kualitas.
              </p>
            </div>
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-md overflow-hidden relative">
              <Image
                src="/images/hero/produk-listing-banner.svg"
                alt="Noblekase produk"
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
            <ProductFilterSidebar totalCount={products.length} categories={categories} />

            <div>
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <div className="text-sm text-ink-secondary">
                  Menampilkan{" "}
                  <span className="text-ink-primary font-medium">
                    {products.length}
                  </span>{" "}
                  produk
                </div>
                <div className="text-sm text-ink-tertiary">
                  Urutkan: Default
                </div>
              </div>

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
