/**
 * /cari — halaman hasil pencarian (produk, artikel, kategori).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SmartImage as Image } from "@/components/media/SmartImage";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { ProductCard } from "@/components/cards/ProductCard";
import { SearchForm } from "@/components/search/SearchForm";
import { search } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, localePath, translator, type Locale } from "@/lib/i18n";

// Render dinamis — lihat catatan di src/app/(frontend)/[locale]/[...slug]/page.tsx
export const dynamic = "force-dynamic";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);
  const { q } = await searchParams;
  const meta = await buildMetadata({
    title: q ? tr("search.metaTitleWithQuery", { query: q }) : tr("search.metaTitle"),
    description: tr("search.metaDescription"),
    path: q ? `/cari?q=${encodeURIComponent(q)}` : "/cari",
    locale,
  });

  // Halaman hasil pencarian tidak diindeks: setiap kata kunci menghasilkan
  // URL baru, dan sejak situs dua bahasa jumlahnya berlipat dua. Membiarkannya
  // terindeks hanya mengotori indeks Google dengan halaman tipis. `follow`
  // tetap aktif agar tautan produk di dalamnya tetap ditelusuri.
  return { ...meta, robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);
  const { q = "" } = await searchParams;
  const results = await search(q, locale, 48);
  const hasQuery = q.trim().length >= 2;

  return (
    <>
      <RevealOnScroll />

      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-12 border-b border-border-light">
        <div className="container-prose max-w-2xl">
          <div className="eyebrow mb-3">{tr("search.eyebrow")}</div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-6 tracking-tight">
            {hasQuery
              ? tr("search.resultsFor", { query: results.query })
              : tr("search.headingEmpty")}
          </h1>
          <SearchForm defaultValue={q} autoFocus={!hasQuery} locale={locale} />
          {hasQuery && (
            <p className="mt-4 text-sm text-ink-secondary">
              {results.total > 0
                ? tr("search.countFound", { count: results.total })
                : tr("search.noMatch")}
            </p>
          )}
        </div>
      </section>

      {/* Belum mengetik / kata kunci terlalu pendek */}
      {!hasQuery && (
        <section className="py-16 md:py-20">
          <div className="container-prose max-w-2xl text-center text-ink-secondary">
            <p className="mb-2">{tr("search.minChars")}</p>
            <p className="text-sm">{tr("search.hintExamples")}</p>
          </div>
        </section>
      )}

      {/* Tidak ada hasil */}
      {hasQuery && results.total === 0 && (
        <section className="py-16 md:py-20">
          <div className="container-prose max-w-xl text-center">
            <h2 className="font-serif text-xl md:text-2xl font-medium mb-3">
              {tr("search.emptyHeading")}
            </h2>
            <p className="text-ink-secondary mb-6">{tr("search.emptyBody")}</p>
            <Link
              href={localePath(locale, "/produk")}
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
            >
              {tr("common.viewAllProducts")} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      )}

      {/* Produk */}
      {results.products.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-prose">
            <div className="eyebrow mb-2">{tr("common.products")}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-6">
              {tr("search.productCount", { count: results.products.length })}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {results.products.map((p) => (
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
        </section>
      )}

      {/* Kategori */}
      {results.categories.length > 0 && (
        <section className="py-10 md:py-12 border-t border-border-light">
          <div className="container-prose">
            <div className="eyebrow mb-4">{tr("common.categories")}</div>
            <div className="flex flex-wrap gap-2">
              {results.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={localePath(locale, `/produk/${c.slug}`)}
                  className="px-4 py-2 rounded-full border border-border-mid text-sm hover:border-ink-primary hover:bg-bg-warm transition-colors"
                >
                  {c.name}
                  <span className="ml-1.5 text-[11px] text-ink-tertiary">{c.productCount}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Artikel */}
      {results.articles.length > 0 && (
        <section className="py-12 md:py-16 border-t border-border-light">
          <div className="container-prose">
            <div className="eyebrow mb-2">{tr("common.journal")}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-6">
              {tr("search.articleCount", { count: results.articles.length })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {results.articles.map((a) => (
                <Link
                  key={a.slug}
                  href={localePath(locale, `/journal/${a.slug}`)}
                  className="group"
                >
                  <div className="aspect-[4/3] bg-bg-warm border border-border-light rounded-md overflow-hidden mb-3 hover-zoom relative">
                    {a.coverUrl && (
                      <Image
                        src={a.coverUrl}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
                    {a.category} · {a.readingTime} {tr("common.minutesShort")}
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-medium leading-snug group-hover:text-accent transition-colors">
                    {a.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
