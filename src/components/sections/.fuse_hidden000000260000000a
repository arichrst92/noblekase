/**
 * HeroSection — editorial hero untuk Beranda
 *
 * Layout split 60/40 di desktop, vertical stack di mobile.
 * Konten di-pull dari HeroEditions collection (yang isActive=true).
 * Soft parallax pada hero image saat scroll (GSAP ScrollTrigger).
 */

import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function HeroSection({
  eyebrow = "Edisi · Mei 2026",
  headline = "Aksesoris yang menemani hari-hari setiap orang.",
  subheadline = "Kualitas konsisten. Desain yang tidak biasa. Tersedia untuk semua.",
  imageUrl,
  imageAlt = "Noblekase hero",
  ctaLabel = "Jelajahi produk",
  ctaUrl = "/produk",
}: HeroProps) {
  return (
    <section className="bg-bg-cream pt-32 md:pt-40 pb-20 md:pb-28">
      <div className="container-prose">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-14 items-center">
          {/* Copy */}
          <div className="reveal">
            <div className="eyebrow mb-4">{eyebrow}</div>
            <h1 className="font-serif text-4xl md:text-6xl font-medium leading-[1.1] mb-5 tracking-tight">
              {headline}
            </h1>
            {subheadline && (
              <p className="text-base md:text-lg text-ink-secondary leading-relaxed mb-7 max-w-md">
                {subheadline}
              </p>
            )}
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 bg-ink-primary text-bg-base px-6 py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              {ctaLabel} <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Image with soft parallax target */}
          <div className="reveal" data-parallax="0.15">
            <div className="aspect-[4/3] bg-bg-base border border-border-mid rounded-md overflow-hidden relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                  Hero image · contextual lifestyle
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
