/**
 * /journal — Listing semua artikel.
 * Layout: featured artikel teratas + grid 3-kolom artikel sisanya.
 */

import type { Metadata } from "next";
import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { getArticles, getGlobalData } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, localePath, translator, type Locale } from "@/lib/i18n";

// Render dinamis — lihat catatan di src/app/(frontend)/[locale]/[...slug]/page.tsx
export const dynamic = "force-dynamic";

interface JournalPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: JournalPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);
  const t = await getGlobalData("page-journal", locale);
  return buildMetadata({
    title: t?.headline ?? tr("journal.metaTitle"),
    description: t?.intro ?? tr("journal.metaDescription"),
    path: "/journal",
    locale,
  });
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);

  const [articles, t] = await Promise.all([
    getArticles(locale),
    getGlobalData("page-journal", locale),
  ]);
  const [featured, ...rest] = articles;

  const countText = (t?.countTemplate ?? tr("journal.countTemplate")).replace(
    "{count}",
    String(articles.length),
  );

  return (
    <>
      <RevealOnScroll />

      {/* Hero */}
      <section className="bg-bg-cream pt-32 md:pt-40 pb-10 md:pb-14 border-b border-border-light">
        <div className="container-prose">
          <div className="reveal max-w-2xl">
            <div className="eyebrow mb-3">{t?.eyebrow ?? tr("journal.eyebrow")}</div>
            <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
              {t?.headline ?? tr("journal.heading")}
            </h1>
            <p className="text-base text-ink-secondary leading-relaxed">
              {t?.intro ?? tr("journal.intro")}
            </p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="py-12 md:py-16 border-b border-border-light">
          <div className="container-prose">
            <Link
              href={localePath(locale, `/journal/${featured.slug}`)}
              className="reveal group grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 md:gap-10 items-center"
            >
              <div className="aspect-[4/3] bg-bg-warm border border-border-light rounded-lg overflow-hidden relative hover-zoom">
                <Image
                  src={featured.coverUrl}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-3">
                  {t?.highlightLabel ?? tr("journal.highlightLabel")} · {featured.category} ·{" "}
                  {featured.readingTime} {tr("common.minutesShort")}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-medium leading-tight mb-3 group-hover:text-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="text-base text-ink-secondary leading-relaxed mb-4">
                  {featured.excerpt}
                </p>
                <span className="text-sm font-medium text-ink-primary">
                  {t?.readMoreLabel ?? tr("journal.readMore")}
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Rest */}
      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className="reveal eyebrow mb-2">
            {t?.allArticlesEyebrow ?? tr("journal.allArticlesEyebrow")}
          </div>
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
            {countText}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {rest.map((a, i) => (
              <Link
                key={a.slug}
                href={localePath(locale, `/journal/${a.slug}`)}
                className="reveal group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[4/3] bg-bg-warm border border-border-light rounded-md overflow-hidden mb-3 hover-zoom relative">
                  <Image
                    src={a.coverUrl}
                    alt={a.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
                  {a.category} · {a.readingTime} {tr("common.minutesShort")}
                </div>
                <h3 className="font-serif text-base md:text-lg font-medium leading-snug group-hover:text-accent transition-colors mb-1">
                  {a.title}
                </h3>
                <p className="text-[12px] md:text-xs text-ink-secondary line-clamp-2">
                  {a.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
