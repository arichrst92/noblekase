/**
 * HeroCarousel — carousel slide Beranda (data dari koleksi Slides).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Tanpa dependency eksternal: autoplay, panah, dots, swipe, jeda saat hover,
 * dan menghormati prefers-reduced-motion.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
}

const INTERVAL = 6000;

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, next, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative bg-bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Sorotan Noblekase"
    >
      <div
        className="relative overflow-hidden"
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
          {slides.map((s, i) => (
            <div
              key={s.id}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${count}`}
            >
              <div className="container-prose pt-28 md:pt-32 pb-10 md:pb-14">
                <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-8 md:gap-12 items-center">
                  <div>
                    {s.eyebrow && <div className="eyebrow mb-3">{s.eyebrow}</div>}
                    <h2 className="font-serif text-3xl md:text-5xl font-medium leading-[1.12] mb-4 tracking-tight">
                      {s.headline}
                    </h2>
                    {s.subheadline && (
                      <p className="text-base md:text-lg text-ink-secondary leading-relaxed mb-6 max-w-md">
                        {s.subheadline}
                      </p>
                    )}
                    <Link
                      href={s.ctaUrl}
                      tabIndex={i === index ? 0 : -1}
                      className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
                    >
                      {s.ctaLabel} <span aria-hidden>→</span>
                    </Link>
                  </div>
                  <div className="aspect-[4/3] bg-bg-base border border-border-mid rounded-lg overflow-hidden relative">
                    {s.imageUrl ? (
                      <Image
                        src={s.imageUrl}
                        alt={s.imageAlt}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
                        image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide sebelumnya"
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-base/90 border border-border-mid items-center justify-center hover:bg-bg-base transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-ink-primary" />
          </button>
          <button
            onClick={next}
            aria-label="Slide berikutnya"
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-base/90 border border-border-mid items-center justify-center hover:bg-bg-base transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-ink-primary" />
          </button>

          <div className="flex justify-center gap-2 pb-6">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => go(i)}
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-7 bg-accent" : "w-2.5 bg-border-mid hover:bg-ink-tertiary",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
