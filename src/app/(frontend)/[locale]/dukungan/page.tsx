/**
 * /dukungan — Halaman kontak & dukungan.
 * Konten dari global PageSupport (hero, kanal, jam operasional) + koleksi FAQItems.
 */

import type { Metadata } from "next";
import { PageHeroBanner } from "@/components/sections/PageHeroBanner";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { RichText } from "@/components/richtext/RichText";
import { getGlobalData, getFaqItems, resolveMediaUrl } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { defaultLocale, isLocale, translator, type Locale } from "@/lib/i18n";

interface DukunganPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: DukunganPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);
  const s = await getGlobalData("page-support", locale);
  return buildMetadata({
    title: s?.heroHeadline ?? tr("support.metaTitle"),
    description: s?.heroIntro ?? tr("support.metaDescription"),
    path: "/dukungan",
    image: resolveMediaUrl(s?.heroImage, "og") || undefined,
    locale,
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DukunganPage({ params }: DukunganPageProps) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const tr = translator(locale);
  const [s, faqs] = await Promise.all([
    getGlobalData("page-support", locale),
    getFaqItems(locale),
  ]);
  const heroImg = resolveMediaUrl(s?.heroImage, "banner");
  const channels: any[] = s?.channels ?? [];

  return (
    <>
      <RevealOnScroll />

      {/* Hero — full-bleed, perlakuan sama dengan slide di Beranda.
          Bila gambar belum diunggah, jatuh ke header teks biasa daripada
          menampilkan blok navy kosong. */}
      {heroImg ? (
        <PageHeroBanner
          eyebrow={s?.heroEyebrow ?? tr("support.eyebrow")}
          headline={s?.heroHeadline ?? tr("support.heading")}
          intro={s?.heroIntro ?? tr("support.intro")}
          imageUrl={heroImg}
          imageAlt={s?.heroHeadline ?? tr("support.heroImageAlt")}
        />
      ) : (
        <section className="bg-bg-cream pt-32 md:pt-40 pb-12 md:pb-16 border-b border-border-light">
          <div className="container-prose max-w-2xl">
            <div className="reveal">
              <div className="eyebrow mb-3">
                {s?.heroEyebrow ?? tr("support.eyebrow")}
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-5 tracking-tight">
                {s?.heroHeadline ?? tr("support.heading")}
              </h1>
              <p className="text-base md:text-lg text-ink-secondary leading-relaxed">
                {s?.heroIntro ?? tr("support.intro")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Channels */}
      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className="reveal eyebrow mb-2">
            {s?.channelsEyebrow ?? tr("support.channelsEyebrow")}
          </div>
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
            {s?.channelsHeadline ?? tr("support.channelsHeading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {channels.map((ch, i) => {
              const primary = i === 0;
              return (
                <a
                  key={i}
                  href={ch.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`reveal border rounded-lg p-5 md:p-6 transition-colors ${
                    primary
                      ? "border-ink-primary bg-ink-primary text-bg-base hover:bg-accent"
                      : "border-border-light hover:border-ink-primary hover:bg-bg-warm"
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="text-[10px] tracking-widest uppercase opacity-70 mb-2">
                    {ch.title}
                  </div>
                  <div className="font-serif text-lg md:text-xl font-medium mb-1">
                    {ch.buttonLabel ?? ch.title} →
                  </div>
                  <div
                    className={`text-sm ${primary ? "text-bg-base/80" : "text-ink-secondary"}`}
                  >
                    {ch.description}
                  </div>
                </a>
              );
            })}
          </div>

          {s?.operatingHours && (
            <p className="text-[12px] text-ink-tertiary mt-6 text-center">
              {s.operatingHours}
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-bg-cream py-16 md:py-20 border-t border-border-light">
          <div className="container-prose max-w-3xl">
            <div className="reveal eyebrow mb-2">
              {s?.faqEyebrow ?? tr("support.faqEyebrow")}
            </div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              {s?.faqHeadline ?? tr("support.faqHeading")}
            </h2>
            <div className="space-y-1">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="reveal group border-b border-border-light py-4"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <summary className="list-none flex items-start justify-between gap-4 cursor-pointer">
                    <h3 className="font-serif text-base md:text-lg font-medium group-hover:text-accent transition-colors">
                      {faq.question}
                    </h3>
                    <span className="text-ink-tertiary group-open:rotate-45 transition-transform mt-1">
                      +
                    </span>
                  </summary>
                  <div className="mt-3 text-base text-ink-secondary leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0">
                    <RichText data={faq.answer} locale={locale} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
