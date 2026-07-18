/**
 * PageHeroBanner — blok full-bleed dengan teks di-overlay di atas gambar.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Perlakuannya sengaja disamakan dengan HeroCarousel di Beranda: gambar
 * memenuhi lebar layar, teks di-overlay di atasnya, dengan scrim agar tetap
 * terbaca. Bedanya tanpa autoplay dan hanya satu panel.
 *
 * Dipakai dua peran lewat prop `size`:
 *   - "hero" → header halaman (Produk, Tentang, Dukungan). Lebih tinggi, dan
 *     diberi padding atas karena navbar mengambang di atasnya; tanpa itu
 *     headline tertutup navbar di layar pendek.
 *   - "band" → pita di tengah halaman (mis. section brand di Beranda). Lebih
 *     pendek dan tanpa padding navbar, sebab tidak berada di puncak halaman.
 *
 * Prop `as` ada karena satu halaman hanya boleh punya satu <h1>. Header
 * halaman memakai h1, sedangkan blok di tengah halaman harus h2 supaya
 * hierarki heading tetap benar untuk screen reader dan mesin pencari.
 */

import Link from "next/link";
import { SmartImage as Image } from "@/components/media/SmartImage";
import { cn } from "@/lib/cn";
import { defaultLocale, localeHref, type Locale } from "@/lib/i18n";

interface PageHeroBannerProps {
  eyebrow?: string;
  headline: string;
  intro?: string;
  imageUrl: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Sisi tempat teks diletakkan. Gradasi scrim ikut dibalik mengikutinya. */
  align?: "left" | "right";
  /** Tinggi & padding: header halaman atau pita di tengah halaman. */
  size?: "hero" | "band";
  /** Warna teks di atas gambar. "light" untuk foto gelap, "dark" untuk foto terang. */
  textTheme?: "light" | "dark";
  /** Lapisan peredup agar teks tetap terbaca. Matikan hanya bila foto sudah polos. */
  scrim?: boolean;
  /** Prioritaskan pemuatan gambar — hanya untuk blok di paruh atas halaman. */
  priority?: boolean;
  /** Tingkat heading. Lihat catatan soal <h1> di komentar berkas. */
  as?: "h1" | "h2";
  locale?: Locale;
}

export function PageHeroBanner({
  eyebrow,
  headline,
  intro,
  imageUrl,
  imageAlt,
  ctaLabel,
  ctaUrl,
  align = "left",
  size = "hero",
  textTheme = "light",
  scrim = true,
  priority,
  as: Heading = "h1",
  locale = defaultLocale,
}: PageHeroBannerProps) {
  const light = textTheme === "light";
  const isHero = size === "hero";
  const alignRight = align === "right";

  return (
    <section className="relative w-full overflow-hidden bg-ink-primary">
      <div
        className={cn(
          "relative",
          isHero
            ? "h-[380px] sm:h-[440px] md:h-[500px] lg:h-[560px]"
            : "h-[340px] sm:h-[400px] md:h-[440px]",
        )}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt ?? headline}
            fill
            priority={priority ?? isHero}
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/*
          Scrim dua perlakuan.

          Mobile: peredup RATA menutupi seluruh gambar, dan lebih pekat.
          Gradasi hanya bekerja bila teks punya sisi tetap untuk ditempati —
          di layar sempit teks memakai hampir seluruh lebar, jadi ujung
          gradasi yang bening justru jatuh tepat di bawah teks dan membuatnya
          sulit dibaca.

          md ke atas: kembali ke gradasi supaya foto produk tetap terlihat di
          sisi yang tidak dipakai teks. `md:bg-transparent` wajib ada karena
          warna latar dan gradasi adalah dua properti berbeda — tanpa reset
          itu keduanya menumpuk dan gambarnya jadi terlalu gelap.
        */}
        {scrim && (
          <div
            className={cn(
              "absolute inset-0",
              light
                ? alignRight
                  ? "bg-black/65 md:bg-transparent md:bg-gradient-to-l md:from-black/75 md:via-black/45 md:to-black/10"
                  : "bg-black/65 md:bg-transparent md:bg-gradient-to-r md:from-black/75 md:via-black/45 md:to-black/10"
                : alignRight
                  ? "bg-white/80 md:bg-transparent md:bg-gradient-to-l md:from-white/85 md:via-white/50 md:to-white/10"
                  : "bg-white/80 md:bg-transparent md:bg-gradient-to-r md:from-white/85 md:via-white/50 md:to-white/10",
            )}
          />
        )}

        <div
          className={cn(
            "absolute inset-0 flex items-center",
            isHero && "pt-16 md:pt-20",
          )}
        >
          <div className="container-prose w-full">
            <div
              className={cn(
                "max-w-xl reveal",
                alignRight && "ml-auto",
                light ? "text-white" : "text-ink-primary",
              )}
            >
              {eyebrow && (
                <div
                  className={cn(
                    "text-[11px] uppercase tracking-widest font-medium mb-3",
                    light ? "text-white/85" : "text-accent",
                  )}
                >
                  {eyebrow}
                </div>
              )}

              <Heading
                className={cn(
                  "font-serif font-medium leading-[1.08] tracking-tight mb-4 drop-shadow-sm",
                  isHero
                    ? "text-3xl md:text-5xl lg:text-6xl"
                    : "text-2xl md:text-4xl",
                )}
              >
                {headline}
              </Heading>

              {intro && (
                <p
                  className={cn(
                    "text-base md:text-lg leading-relaxed",
                    light ? "text-white/90" : "text-ink-secondary",
                  )}
                >
                  {intro}
                </p>
              )}

              {ctaLabel && ctaUrl && (
                <Link
                  href={localeHref(locale, ctaUrl)}
                  className={cn(
                    "inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-md text-sm font-medium transition-colors",
                    light
                      ? "bg-accent text-white hover:bg-white hover:text-ink-primary"
                      : "bg-ink-primary text-bg-base hover:bg-accent",
                  )}
                >
                  {ctaLabel} <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
