/**
 * /dukungan — Halaman kontak & dukungan.
 * Konten dari global PageSupport (hero, kanal, jam operasional) + koleksi FAQItems.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";
import { RichText } from "@/components/richtext/RichText";
import { getGlobalData, getFaqItems, resolveMediaUrl } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getGlobalData("page-support");
  return {
    title: "Dukungan",
    description:
      s?.heroIntro ??
      "Hubungi tim Noblekase via WhatsApp, Instagram, atau email. Lihat FAQ untuk pertanyaan umum.",
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DukunganPage() {
  const [s, faqs] = await Promise.all([getGlobalData("page-support"), getFaqItems()]);
  const heroImg = resolveMediaUrl(s?.heroImage, "landscape");
  const channels: any[] = s?.channels ?? [];

  return (
    <>
      <RevealOnScroll />

      {/* Hero */}
      <section className="bg-bg-cream pt-32 md:pt-40 pb-12 md:pb-16 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">{s?.heroEyebrow ?? "Dukungan"}</div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-5 tracking-tight">
                {s?.heroHeadline ?? "Bantu kami menjawab Anda"}
              </h1>
              <p className="text-base md:text-lg text-ink-secondary leading-relaxed">
                {s?.heroIntro ??
                  "Tim kecil yang membaca semua pesan. Cara tercepat lewat WhatsApp di jam kerja, atau DM Instagram kapan saja."}
              </p>
            </div>
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-lg overflow-hidden relative">
              {heroImg ? (
                <Image
                  src={heroImg}
                  alt={s?.heroHeadline ?? "Kontak Noblekase"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
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
      </section>

      {/* Channels */}
      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className="reveal eyebrow mb-2">{s?.channelsEyebrow ?? "Kanal"}</div>
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
            {s?.channelsHeadline ?? "Pilih cara yang paling nyaman"}
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
                  <div className={`text-sm ${primary ? "text-bg-base/80" : "text-ink-secondary"}`}>
                    {ch.description}
                  </div>
                </a>
              );
            })}
          </div>

          {s?.operatingHours && (
            <p className="text-[12px] text-ink-tertiary mt-6 text-center">{s.operatingHours}</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="bg-bg-cream py-16 md:py-20 border-t border-border-light">
          <div className="container-prose max-w-3xl">
            <div className="reveal eyebrow mb-2">{s?.faqEyebrow ?? "FAQ"}</div>
            <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-8">
              {s?.faqHeadline ?? "Pertanyaan yang sering ditanyakan"}
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
                    <RichText data={faq.answer} />
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
