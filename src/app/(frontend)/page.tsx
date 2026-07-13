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
 * Data source: sample-data.ts (showcase phase).
 * Phase 2: migrate ke Payload CMS fetch.
 */

import { HeroSection } from "@/components/sections/HeroSection";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FeaturedCollection } from "@/components/sections/FeaturedCollection";
import { BrandSnippet } from "@/components/sections/BrandSnippet";
import { JournalTeaser } from "@/components/sections/JournalTeaser";
import { MarketplaceCTA } from "@/components/sections/MarketplaceCTA";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";

import {
  heroEdition,
  categories,
  products,
  articles,
  featuredCollection,
  getProductBySlug,
} from "@/lib/sample-data";

export default function HomePage() {
  const main = getProductBySlug(featuredCollection.mainProductSlug);
  const sec1 = getProductBySlug(featuredCollection.secondaryProductSlugs[0]);
  const sec2 = getProductBySlug(featuredCollection.secondaryProductSlugs[1]);

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
        eyebrow={heroEdition.eyebrow}
        headline={heroEdition.headline}
        subheadline={heroEdition.subheadline}
        imageUrl={heroEdition.imageUrlDesktop}
        imageAlt="Noblekase Edisi Mei 2026"
        ctaLabel={heroEdition.ctaLabel}
        ctaUrl={heroEdition.ctaUrl}
      />

      <CategoryGrid
        categories={categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          productCount: c.productCount,
          imageUrl: c.imageUrl,
        }))}
      />

      {main && sec1 && sec2 && (
        <FeaturedCollection
          eyebrow={featuredCollection.eyebrow}
          headline={featuredCollection.headline}
          subheadline={featuredCollection.subheadline}
          mainProduct={{
            name: main.name,
            slug: main.slug,
            imageUrl: main.imageUrl,
          }}
          secondaryProducts={[
            { name: sec1.name, slug: sec1.slug, imageUrl: sec1.imageUrl },
            { name: sec2.name, slug: sec2.slug, imageUrl: sec2.imageUrl },
          ]}
        />
      )}

      <BrandSnippet imageUrl="/images/hero/brand-story-tentang-noblekase.svg" />

      <JournalTeaser articles={teaserArticles} />

      <MarketplaceCTA />
    </>
  );
}
