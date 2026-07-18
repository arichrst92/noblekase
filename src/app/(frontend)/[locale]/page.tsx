/**
 * Beranda — Halaman Utama Customer Site
 *
 * Pattern: Hybrid Story + Quick Access
 * Sections:
 *   1. Hero (editorial, soft parallax)
 *   2. Pilih Kategori (4 cards)
 *   3. Cerita Edisi Ini (featured collection)
 *   4. Tentang Noblekase (brand snippet)
 *   5. Dari Journal (3 latest articles)
 *   6. Dapatkan Di (marketplace CTA)
 *
 * Data source: Payload CMS (hero, kategori, featured).
 * Journal teaser masih sample-data — akan dipindah di Sprint 2.
 */

import { HeroSection } from "@/components/sections/HeroSection";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ProductTabs } from "@/components/sections/ProductTabs";
import { PromoBanner } from "@/components/sections/PromoBanner";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FeaturedCollection } from "@/components/sections/FeaturedCollection";
import { BrandSnippet } from "@/components/sections/BrandSnippet";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { MarketplaceCTA } from "@/components/sections/MarketplaceCTA";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";

import type { Metadata } from "next";
import {
  getActiveHero,
  getCategories,
  getActiveFeatured,
  getArticles,
  getGlobalData,
  getSlides,
  getProducts,
  resolveMediaUrl,
} from "@/lib/queries";
import {
  defaultLocale,
  isLocale,
  localePath,
  t,
  type Locale,
} from "@/lib/i18n";
import { languageAlternates } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

// Judul/deskripsi/OG diwarisi dari root layout (Site Settings). Di sini cukup
// canonical + hreflang, keduanya mengikuti bahasa yang sedang dibuka.
export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  return {
    alternates: {
      canonical: localePath(locale, "/"),
      languages: languageAlternates("/"),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  const [hero, categories, featured, articles, home, slides, products] =
    await Promise.all([
      getActiveHero(locale),
      getCategories(locale),
      getActiveFeatured(locale),
      getArticles(locale),
      getGlobalData("page-home", locale),
      getSlides(locale),
      getProducts(locale),
    ]);
  // Varian `banner` (21:9) dipakai karena section brand kini full-bleed;
  // varian kartu 4:3 akan terlihat pecah saat direntangkan selebar layar.
  const brandImageUrl =
    resolveMediaUrl(home?.brandImage, "banner") ||
    "/images/hero/brand-story-tentang-noblekase.svg";

  const tabProducts = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    imageUrl: p.imageUrl,
    badge: p.badge,
    marketplaceKeys: p.marketplaces.map((m) => m.key),
  }));

  // Beranda journal: 3 artikel terbaru
  const teaserArticles = articles.slice(0, 3).map((a) => ({
    title: a.title,
    slug: a.slug,
    category: a.category,
    readingTime: a.readingTime,
    imageUrl: a.coverUrl,
  }));

  return (
    <>
      <RevealOnScroll />

      {/* 1. Carousel (koleksi Slides). Fallback ke hero tunggal bila belum ada slide. */}
      {slides.length > 0 ? (
        <HeroCarousel slides={slides} locale={locale} />
      ) : (
        <HeroSection
          eyebrow={hero?.eyebrow}
          headline={hero?.headline}
          subheadline={hero?.subheadline}
          imageUrl={hero?.imageUrl}
          imageAlt={hero?.imageAlt}
          ctaLabel={hero?.ctaLabel}
          ctaUrl={hero?.ctaUrl}
          locale={locale}
        />
      )}

      {/* 2. Tile kategori */}
      <CategoryGrid
        categories={categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          productCount: c.productCount,
          imageUrl: c.imageUrl,
        }))}
        locale={locale}
      />

      {/* 3. Grid produk bertab */}
      <ProductTabs
        products={tabProducts}
        eyebrow={home?.productsEyebrow ?? undefined}
        headline={home?.productsHeadline ?? undefined}
        labels={{
          new: home?.tabNewLabel ?? t(locale, "productTabs.tab.new"),
          best: home?.tabBestLabel ?? t(locale, "productTabs.tab.best"),
          all: home?.tabAllLabel ?? t(locale, "productTabs.tab.all"),
        }}
        seeAllLabel={home?.seeAllLabel ?? undefined}
        locale={locale}
      />

      {/* 4. Banner promo */}
      <PromoBanner
        eyebrow={home?.promoEyebrow ?? undefined}
        headline={home?.promoHeadline ?? undefined}
        ctaLabel={home?.promoCtaLabel ?? undefined}
        ctaUrl={home?.promoCtaUrl ?? undefined}
        imageUrl={resolveMediaUrl(home?.promoImage, "banner") || undefined}
        locale={locale}
      />

      {/* 5. Koleksi pilihan */}
      {featured && (
        <FeaturedCollection
          eyebrow={featured.eyebrow}
          headline={featured.headline}
          subheadline={featured.subheadline}
          mainProduct={featured.mainProduct}
          secondaryProducts={featured.secondaryProducts}
          locale={locale}
        />
      )}

      <BrandSnippet
        imageUrl={brandImageUrl}
        eyebrow={home?.brandEyebrow ?? undefined}
        headline={home?.brandHeadline ?? undefined}
        body={home?.brandBody ?? undefined}
        ctaLabel={home?.brandCtaLabel ?? undefined}
        ctaUrl={home?.brandCtaUrl ?? undefined}
        locale={locale}
      />

      {/* 6. Marketplace CTA (jalur konversi) lalu 7. teaser Journal */}
      <MarketplaceCTA locale={locale} />

      <JournalTeaser
        articles={teaserArticles}
        eyebrow={home?.journalEyebrow ?? undefined}
        headline={home?.journalHeadline ?? undefined}
        locale={locale}
      />
    </>
  );
}
