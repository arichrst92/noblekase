/**
 * BrandSnippet — section "Tentang Noblekase" di Beranda.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Tampil sebagai pita full-bleed: gambar memenuhi lebar layar dengan teks
 * di-overlay di sisi kanan, sama seperti slide di Beranda dan header halaman
 * Produk/Tentang/Dukungan. Markupnya tidak ditulis ulang di sini — semuanya
 * memakai PageHeroBanner supaya perlakuan full-bleed cukup diatur di satu
 * tempat.
 *
 * Headline-nya h2, bukan h1: blok ini berada di tengah Beranda, sedangkan h1
 * halaman sudah dipakai bagian lain.
 *
 * Bila gambar belum diunggah, blok ini tidak dirender full-bleed melainkan
 * jatuh ke layout teks biasa — pita full-bleed tanpa gambar hanya menghasilkan
 * blok navy kosong.
 */

import Link from "next/link";
import { PageHeroBanner } from "@/components/sections/PageHeroBanner";
import { defaultLocale, localeHref, translator, type Locale } from "@/lib/i18n";

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

  if (imageUrl) {
    return (
      <PageHeroBanner
        as="h2"
        size="band"
        align="right"
        eyebrow={eyebrow}
        headline={headline}
        intro={body}
        ctaLabel={ctaLabel}
        ctaUrl={ctaUrl}
        imageUrl={imageUrl}
        imageAlt={tr("brandSnippet.imageAlt")}
        locale={locale}
      />
    );
  }

  return (
    <section className="bg-bg-cream py-16 md:py-24">
      <div className="container-prose max-w-2xl">
        <div className="reveal">
          <div className="eyebrow mb-3">{eyebrow}</div>
          <h2 className="font-serif text-2xl md:text-3xl font-medium mb-4">
            {headline}
          </h2>
          <p className="text-base text-ink-secondary leading-relaxed mb-5">
            {body}
          </p>
          <Link
            href={localeHref(locale, ctaUrl)}
            className="text-sm font-medium text-ink-primary hover:text-accent"
          >
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
}
