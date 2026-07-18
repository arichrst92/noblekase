/**
 * PromoBanner — banner promo lebar di Beranda (konten dari global Beranda).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

import Image from "next/image";
import Link from "next/link";

interface PromoBannerProps {
  eyebrow?: string;
  headline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
}

export function PromoBanner({
  eyebrow = "Edisi Berjalan",
  headline = "Perlengkapan harian, satu paket",
  ctaLabel = "Jelajahi koleksi",
  ctaUrl = "/produk",
  imageUrl,
}: PromoBannerProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container-prose">
        <Link
          href={ctaUrl}
          className="reveal group relative block overflow-hidden rounded-lg border border-border-light bg-bg-warm"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] items-center">
            <div className="p-7 md:p-12">
              <div className="eyebrow mb-2">{eyebrow}</div>
              <h2 className="font-serif text-2xl md:text-4xl font-medium leading-tight mb-5">
                {headline}
              </h2>
              <span className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-md text-sm font-medium group-hover:bg-ink-primary transition-colors">
                {ctaLabel} <span aria-hidden>→</span>
              </span>
            </div>
            <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={headline}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                  image
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
