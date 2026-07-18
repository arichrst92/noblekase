/**
 * HeroCarousel — carousel full-bleed Beranda (data dari koleksi Slides).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Gambar memenuhi lebar layar, teks di-overlay di atasnya. Tanpa dependency
 * eksternal: autoplay, panah, dots, swipe, jeda saat hover, dan menghormati
 * prefers-reduced-motion.
 */

"use client";

import { SmartImage as Image } from "@/components/media/SmartImage";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

export interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  imageMobileUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  textAlign: "left" | "center";
  textTheme: "light" | "dark";
  scrim: boolean;
}

const INTERVAL = 6000;

export function HeroCarousel({
  slides,
  locale = defaultLocale,
}: {
  slides: Slide[];
  locale?: Locale;
}) {
  const tr = translator(locale);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, next, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-ink-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={tr("carousel.ariaLabel")}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => {
          const light = s.textTheme === "light";
          const hasText = Boolean(s.eyebrow || s.headline || s.subheadline || s.ctaLabel);
          return (
            <div
              key={s.id}
              className="relative w-full shrink-0"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={tr("carousel.slideOfTemplate", { index: i + 1, total: count })}
            >
              <Link
                href={s.ctaUrl.startsWith("/") ? localePath(locale, s.ctaUrl) : s.ctaUrl}
                tabIndex={i === index ? 0 : -1}
                className="block"
              >
                {/* Tinggi responsif — gambar selalu memenuhi lebar */}
                <div className="relative h-[420px] sm:h-[480px] md:h-[560px] lg:h-[640px]">
                  {s.imageUrl && (
                    <Image
                      src={s.imageMobileUrl || s.imageUrl}
                      alt={s.imageAlt}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover md:hidden"
                    />
                  )}
                  {s.imageUrl && (
                    <Image
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      fill
                      priority={i === 0}
                      sizes="100vw"
                      className="object-cover hidden md:block"
                    />
                  )}

                  {/* Scrim agar teks terbaca */}
                  {hasText && s.scrim && (
                    <div
                      className={cn(
                        "absolute inset-0",
                        light
                          ? s.textAlign === "left"
                            ? "bg-gradient-to-r from-black/65 via-black/35 to-transparent"
                            : "bg-black/40"
                          : s.textAlign === "left"
                            ? "bg-gradient-to-r from-white/75 via-white/40 to-transparent"
                            : "bg-white/45",
                      )}
                    />
                  )}

                  {/* Teks overlay */}
                  {hasText && (
                    <div className="absolute inset-0 flex items-center">
                      <div className="container-prose w-full">
                        <div
                          className={cn(
                            "max-w-xl",
                            s.textAlign === "center" && "mx-auto text-center",
                            light ? "text-white" : "text-ink-primary",
                          )}
                        >
                          {s.eyebrow && (
                            <div
                              className={cn(
                                "text-[11px] uppercase tracking-widest font-medium mb-3",
                                light ? "text-white/85" : "text-accent",
                              )}
                            >
                              {s.eyebrow}
                            </div>
                          )}
                          {s.headline && (
                            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.08] tracking-tight mb-4 drop-shadow-sm">
                              {s.headline}
                            </h2>
                          )}
                          {s.subheadline && (
                            <p
                              className={cn(
                                "text-base md:text-lg leading-relaxed mb-6",
                                s.textAlign === "center" && "mx-auto",
                                light ? "text-white/90" : "text-ink-secondary",
                              )}
                            >
                              {s.subheadline}
                            </p>
                          )}
                          {s.ctaLabel && (
                            <span className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-white hover:text-ink-primary transition-colors">
                              {s.ctaLabel} <span aria-hidden>→</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label={tr("carousel.prev")}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            aria-label={tr("carousel.next")}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={tr("carousel.goToSlide", { index: i + 1 })}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-accent" : "w-2 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
