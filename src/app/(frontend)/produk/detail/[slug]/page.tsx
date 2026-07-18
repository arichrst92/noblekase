/**
 * /produk/detail/[slug] — Halaman detail produk.
 * Layout: sticky gallery kiri + scrolling info kanan (desktop).
 * Mobile: full-bleed carousel + sticky bottom CTA bar.
 */

import type { Metadata } from "next";
import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { ProductCard } from "@/components/cards/ProductCard";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.tagline,
    path: `/produk/detail/${slug}`,
    image: product.ogUrl,
  });
}

export default async function ProductDetailPage({
  params,
}: ProductDetailProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <RevealOnScroll />

      <ProductJsonLd
        name={product.name}
        description={product.seoDescription ?? product.tagline}
        imageUrl={product.imageUrl}
        path={`/produk/detail/${product.slug}`}
        category={product.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Beranda", path: "/" },
          { name: "Produk", path: "/produk" },
          ...(product.categorySlug
            ? [{ name: product.category, path: `/produk/${product.categorySlug}` }]
            : []),
          { name: product.name, path: `/produk/detail/${product.slug}` },
        ]}
      />

      <article className="pt-28 md:pt-32 pb-24 md:pb-20">
        <div className="container-prose">
          {/* Breadcrumb */}
          <nav className="text-[12px] text-ink-tertiary mb-6 flex items-center gap-1.5">
            <Link href="/" className="hover:text-ink-primary">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/produk" className="hover:text-ink-primary">
              Produk
            </Link>
            <span>/</span>
            <Link
              href={`/produk/${product.categorySlug}`}
              className="hover:text-ink-primary"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-ink-secondary">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 md:gap-16">
            {/* Gallery — sticky on desktop */}
            <div className="md:sticky md:top-28 md:self-start">
              <div className="reveal aspect-square bg-bg-warm border border-border-light rounded-lg overflow-hidden relative mb-3">
                <Image
                  src={product.gallery[0] ?? product.imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 text-[10px] tracking-wider rounded-sm bg-ink-primary text-bg-base">
                    {product.badge}
                  </span>
                )}
              </div>
              {product.gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.gallery.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-bg-warm border border-border-light rounded-md overflow-hidden relative"
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${i + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="reveal">
              <div className="eyebrow mb-3">{product.category}</div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-3 tracking-tight">
                {product.name}
              </h1>
              <p className="text-lg text-ink-secondary leading-relaxed mb-7">
                {product.tagline}
              </p>

              {/* Marketplace cards */}
              <div className="border border-border-light rounded-lg p-4 md:p-5 mb-8">
                <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
                  Beli di marketplace pilihan
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {product.marketplaces.map((m) => (
                    <Link
                      key={m.key}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-border-light rounded-md p-3 hover:border-ink-primary hover:bg-bg-warm transition-colors"
                    >
                      <div className="text-sm font-medium">{m.name}</div>
                      {m.badge && (
                        <div className="text-[10px] text-ink-tertiary mt-1">
                          {m.badge === "best-price"
                            ? "Harga terbaik"
                            : m.badge === "fast-ship"
                              ? "Pengiriman cepat"
                              : "Baru rilis"}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Noblekase%2C%20saya%20tertarik%20dengan%20produk%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 bg-ink-primary text-bg-base py-2.5 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                >
                  Tanya via WhatsApp →
                </a>
              </div>

              {/* Story */}
              <div className="mb-8">
                <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
                  Cerita Produk
                </div>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {product.story}
                </p>
              </div>

              {/* Specs */}
              <div className="mb-2">
                <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
                  Spesifikasi
                </div>
                <dl className="border-t border-border-light">
                  {product.specs.map((s) => (
                    <div
                      key={s.label}
                      className="grid grid-cols-[140px_1fr] gap-4 py-2.5 border-b border-border-light text-sm"
                    >
                      <dt className="text-ink-tertiary">{s.label}</dt>
                      <dd className="text-ink-primary">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Lifestyle gallery */}
      {product.lifestyle && product.lifestyle.length > 0 && (
        <section className="bg-bg-cream py-16 md:py-20 border-y border-border-light">
          <div className="container-prose">
            <div className="reveal eyebrow mb-2">Dalam Keseharian</div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              {product.name} di hari-hari biasa
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {product.lifestyle.map((img, i) => (
                <div
                  key={i}
                  className="reveal aspect-square bg-bg-base border border-border-light rounded-md overflow-hidden relative hover-zoom"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <Image
                    src={img}
                    alt={`Lifestyle ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-prose">
            <div className="reveal eyebrow mb-2">Mungkin juga cocok</div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              Produk lain yang sering dipasangkan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {related.map((p) => (
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
        </section>
      )}

      {/* Mobile sticky bottom CTA */}
      <div className="md:hidden fixed bottom-20 left-3 right-3 z-40">
        <a
          href={product.marketplaces[0]?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-nav flex items-center justify-between px-4 py-3"
        >
          <span className="text-sm font-medium text-ink-primary">
            Beli {product.name}
          </span>
          <span className="text-xs px-2.5 py-1 bg-ink-primary text-bg-base rounded-full">
            →
          </span>
        </a>
      </div>
    </>
  );
}
