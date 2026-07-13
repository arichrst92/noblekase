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
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FeaturedCollection } from "@/components/sections/FeaturedCollection";
import { BrandSnippet } from "@/components/sections/BrandSnippet";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { MarketplaceCTA } from "@/components/sections/MarketplaceCTA";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";

import { getActiveHero, getCategories, getActiveFeatured, getArticles } from "@/lib/queries";

export default async function HomePage() {
  const [hero, categories, featured, articles] = await Promise.all([
    getActiveHero(),
    getCategories(),
    getActiveFeatured(),
    getArticles(),
  ]);

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

      <HeroSection
        eyebrow={hero?.eyebrow}
        headline={hero?.headline}
        subheadline={hero?.subheadline}
        imageUrl={hero?.imageUrl}
        imageAlt={hero?.imageAlt}
        ctaLabel={hero?.ctaLabel}
        ctaUrl={hero?.ctaUrl}
      />

      <CategoryGrid
        categories={categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          productCount: c.productCount,
          imageUrl: c.imageUrl,
        }))}
      />

      {featured && (
        <FeaturedCollection
          eyebrow={featured.eyebrow}
          headline={featured.headline}
          subheadline={featured.subheadline}
          mainProduct={featured.mainProduct}
          secondaryProducts={featured.secondaryProducts}
        />
      )}

      <BrandSnippet imageUrl="/images/hero/brand-story-tentang-noblekase.svg" />

      <JournalTeaser articles={teaserArticles} />

      <MarketplaceCTA />
    </>
  );
}
