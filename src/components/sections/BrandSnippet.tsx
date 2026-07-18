/**
 * BrandSnippet — section "Tentang Noblekase" di Beranda
 * Split layout dengan image kiri + copy kanan (atau sebaliknya).
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

interface BrandSnippetProps {
  eyebrow?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  locale?: Locale;
}

export function BrandSnippet({
  eyebrow: eyebrowProp,
  headline: headlineProp,
  body: bodyProp,
  ctaLabel: ctaLabelProp,
  ctaUrl = "/tentang",
  imageUrl,
  locale = defaultLocale,
}: BrandSnippetProps) {
  const tr = translator(locale);
  // Fallback mengikuti bahasa aktif ketika field CMS masih kosong.
  const eyebrow = eyebrowProp ?? tr("brandSnippet.eyebrow");
  const headline = headlineProp ?? tr("brandSnippet.headline");
  const body = bodyProp ?? tr("brandSnippet.body");
  const ctaLabel = ctaLabelProp ?? tr("brandSnippet.cta");

  return (
    <section className="bg-bg-cream py-16 md:py-24">
      <div className="container-prose">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center">
          <div className="reveal aspect-[1.2/1] bg-bg-base border border-border-mid rounded-md overflow-hidden relative">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={tr("brandSnippet.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                {tr("brandSnippet.imagePlaceholder")}
              </div>
            )}
          </div>

          <div className="reveal">
            <div className="eyebrow mb-3">{eyebrow}</div>
            <h2 className="font-serif text-2xl md:text-3xl font-medium mb-4">{headline}</h2>
            <p className="text-base text-ink-secondary leading-relaxed mb-5">{body}</p>
            <Link
              href={ctaUrl.startsWith("/") ? localePath(locale, ctaUrl) : ctaUrl}
              className="text-sm font-medium text-ink-primary hover:text-accent"
            >
              {ctaLabel} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
