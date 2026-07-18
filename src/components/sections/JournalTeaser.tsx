/**
 * JournalTeaser — 3 artikel terbaru di Beranda
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

interface Article {
  title: string;
  slug: string;
  category: string;
  readingTime: number;
  imageUrl?: string;
}

interface JournalTeaserProps {
  eyebrow?: string;
  headline?: string;
  articles?: Article[];
  locale?: Locale;
}

const defaultArticles: Article[] = [
  {
    title: "Memilih charger GaN untuk traveler",
    slug: "memilih-charger-gan",
    category: "Panduan",
    readingTime: 5,
  },
  {
    title: "Hari pertama dengan setup minimalis",
    slug: "setup-minimalis",
    category: "Cerita",
    readingTime: 3,
  },
  {
    title: "USB-C 2.0 vs 3.1: apa bedanya?",
    slug: "usbc-2-vs-3",
    category: "Edukasi",
    readingTime: 4,
  },
];

export function JournalTeaser({
  eyebrow: eyebrowProp,
  headline: headlineProp,
  articles = defaultArticles,
  locale = defaultLocale,
}: JournalTeaserProps) {
  const tr = translator(locale);
  // Fallback mengikuti bahasa aktif ketika field CMS masih kosong.
  const eyebrow = eyebrowProp ?? tr("journalTeaser.eyebrow");
  const headline = headlineProp ?? tr("journalTeaser.headline");

  return (
    <section className="py-16 md:py-24 border-b border-border-light">
      <div className="container-prose">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div className="reveal">
            <div className="eyebrow mb-2">{eyebrow}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium">{headline}</h2>
          </div>
          <Link
            href={localePath(locale, "/journal")}
            className="text-sm text-ink-secondary hover:text-ink-primary"
          >
            {tr("common.viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {articles.map((article, i) => (
            <Link
              key={article.slug}
              href={localePath(locale, `/journal/${article.slug}`)}
              className="reveal group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[4/3] bg-bg-warm border border-border-mid rounded-md overflow-hidden mb-3 hover-zoom">
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-ink-tertiary">
                    {tr("common.imagePlaceholder")}
                  </div>
                )}
              </div>
              <div className="text-[10px] tracking-widest uppercase text-ink-tertiary mb-2">
                {article.category} · {article.readingTime} {tr("common.minutesShort")}
              </div>
              <h3 className="font-serif text-base md:text-lg font-medium leading-snug group-hover:text-accent transition-colors">
                {article.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
