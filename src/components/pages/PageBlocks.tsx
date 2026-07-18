/**
 * PageBlocks — render blocks koleksi Pages (Tentang, dll) → React.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Block types: hero, pillars, story, numberedList, cta.
 */

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { RichText } from "@/components/richtext/RichText";
import { PageHeroBanner } from "@/components/sections/PageHeroBanner";
import { resolveMediaUrl } from "@/lib/queries";
import { defaultLocale, localePath, t, type Locale } from "@/lib/i18n";

/* eslint-disable @typescript-eslint/no-explicit-any */

function HeroBlock(b: any) {
  const locale: Locale = b.locale ?? defaultLocale;
  // Varian `banner` (21:9) dipakai karena hero kini memenuhi lebar layar.
  const img = resolveMediaUrl(b.image, "banner");
  const centered = b.alignment === "center";

  /*
   * Hero full-bleed hanya dipakai bila ADA gambar dan editor tidak memilih
   * layout terpusat. Tanpa gambar, banner full-bleed cuma menghasilkan blok
   * navy kosong — dalam dua kasus itu layout lama yang lebih masuk akal.
   */
  if (!centered && img) {
    return (
      <PageHeroBanner
        eyebrow={b.eyebrow || undefined}
        headline={b.headline}
        intro={b.subheadline || undefined}
        imageUrl={img}
        imageAlt={b.headline ?? ""}
      />
    );
  }

  return (
    <section className="bg-bg-cream pt-32 md:pt-40 pb-12 md:pb-20 border-b border-border-light">
      <div className="container-prose">
        <div
          className={
            centered
              ? "max-w-2xl mx-auto text-center"
              : "grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center"
          }
        >
          <div className="reveal">
            {b.eyebrow && <div className="eyebrow mb-3">{b.eyebrow}</div>}
            <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-5 tracking-tight">
              {b.headline}
            </h1>
            {b.subheadline && (
              <p className="text-base md:text-lg text-ink-secondary leading-relaxed">
                {b.subheadline}
              </p>
            )}
          </div>
          {!centered && (
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-lg overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                {t(locale, "common.imagePlaceholder")}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StoryBlock(b: any, key: number, locale: Locale) {
  const img = resolveMediaUrl(b.image, "landscape");
  const right = b.imagePosition === "right";
  return (
    <section key={key} className="py-14 md:py-20">
      <div className="container-prose">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div
            className={`reveal aspect-[4/3] bg-bg-warm border border-border-light rounded-lg overflow-hidden relative hover-zoom ${right ? "md:order-2" : ""}`}
          >
            {img ? (
              <Image
                src={img}
                alt={b.headline ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                {t(locale, "common.imagePlaceholder")}
              </div>
            )}
          </div>
          <div className="reveal">
            {b.eyebrow && <div className="eyebrow mb-3">{b.eyebrow}</div>}
            {b.headline && (
              <h2 className="font-serif text-2xl md:text-4xl font-medium leading-tight mb-4">
                {b.headline}
              </h2>
            )}
            <RichText
              data={b.body}
              className="text-base md:text-lg text-ink-secondary leading-relaxed"
              locale={locale}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PillarsBlock(b: any, key: number) {
  return (
    <section
      key={key}
      className="py-14 md:py-20 bg-bg-cream border-y border-border-light"
    >
      <div className="container-prose">
        {b.eyebrow && <div className="reveal eyebrow mb-2">{b.eyebrow}</div>}
        {b.headline && (
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
            {b.headline}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {(b.items ?? []).map((it: any, i: number) => (
            <div key={i} className="reveal">
              <h3 className="font-serif text-lg md:text-xl font-medium mb-2">
                {it.title}
              </h3>
              {it.description && (
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {it.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NumberedListBlock(b: any, key: number) {
  return (
    <section key={key} className="py-14 md:py-20">
      <div className="container-prose">
        {b.eyebrow && <div className="reveal eyebrow mb-2">{b.eyebrow}</div>}
        {b.headline && (
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
            {b.headline}
          </h2>
        )}
        <div className="space-y-8">
          {(b.items ?? []).map((it: any, i: number) => (
            <div key={i} className="reveal grid grid-cols-[auto_1fr] gap-5">
              <div className="eyebrow">0{i + 1}</div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-medium mb-2">
                  {it.title}
                </h3>
                {it.description && (
                  <p className="text-base text-ink-secondary leading-relaxed">
                    {it.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBlock(b: any, key: number, locale: Locale) {
  return (
    <section
      key={key}
      className="bg-bg-cream py-14 md:py-16 border-t border-border-light"
    >
      <div className="container-prose text-center max-w-xl">
        <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-5">
          {b.headline}
        </h2>
        {b.buttonLabel && (
          <div className="reveal">
            <Link
              href={
                typeof b.buttonUrl === "string" && b.buttonUrl.startsWith("/")
                  ? localePath(locale, b.buttonUrl)
                  : (b.buttonUrl ?? "#")
              }
              className="inline-block bg-ink-primary text-bg-base px-6 py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              {b.buttonLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function PageBlocks({
  blocks,
  locale = defaultLocale,
}: {
  blocks: any[];
  locale?: Locale;
}) {
  return (
    <>
      {(blocks ?? []).map((b, i) => {
        switch (b.blockType) {
          case "hero":
            return <HeroBlock key={i} {...b} locale={locale} />;
          case "story":
            return StoryBlock(b, i, locale);
          case "pillars":
            return PillarsBlock(b, i);
          case "numberedList":
            return NumberedListBlock(b, i);
          case "cta":
            return CtaBlock(b, i, locale);
          default:
            return null;
        }
      })}
    </>
  );
}
