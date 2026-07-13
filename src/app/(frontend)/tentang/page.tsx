/**
 * /tentang — Brand story page.
 * Sections: hero, visi, proses, value, CTA.
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "@/components/animation/RevealOnScroll";

export const metadata: Metadata = {
  title: "Tentang Noblekase",
  description:
    "Cerita di balik Noblekase: aksesoris yang menemani hari-hari setiap orang dengan kualitas konsisten dan desain editorial.",
};

const values = [
  {
    title: "Visi",
    body: "Aksesoris harian yang berkualitas dan terdesain baik, tanpa harus mengeluarkan biaya berlebihan.",
    imageUrl: "/images/tentang/tentang-01-visi.svg",
  },
  {
    title: "Proses",
    body: "Kami memilih supplier dengan standar pengujian ketat, mengaudit material secara berkala, dan memprioritaskan packaging yang minim plastik.",
    imageUrl: "/images/tentang/tentang-02-proses.svg",
  },
  {
    title: "Value",
    body: "Bukan brand mewah, bukan juga produk asal-asalan. Noblekase berdiri di tengah — terjangkau, awet, dan didesain dengan rasa.",
    imageUrl: "/images/tentang/tentang-03-value.svg",
  },
];

export default function TentangPage() {
  return (
    <>
      <RevealOnScroll />

      {/* Hero */}
      <section className="bg-bg-cream pt-32 md:pt-40 pb-12 md:pb-20 border-b border-border-light">
        <div className="container-prose">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
            <div className="reveal">
              <div className="eyebrow mb-3">Tentang</div>
              <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-5 tracking-tight">
                Aksesoris yang menemani hari-hari setiap orang.
              </h1>
              <p className="text-base md:text-lg text-ink-secondary leading-relaxed mb-5">
                Noblekase lahir dari kebutuhan sederhana: kabel yang tidak
                mudah rusak, charger yang ringkas, dan casing yang awet
                dipakai. Kami percaya kualitas yang konsisten tidak harus mahal.
              </p>
              <p className="text-base text-ink-secondary leading-relaxed">
                Setiap edisi punya cerita dan tema visual sendiri — tapi
                semuanya kembali ke satu hal: aksesoris yang Anda andalkan
                tanpa berpikir dua kali.
              </p>
            </div>
            <div className="reveal aspect-[4/3] bg-bg-base border border-border-mid rounded-lg overflow-hidden relative">
              <Image
                src="/images/tentang/tentang-hero.svg"
                alt="Tentang Noblekase"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three values */}
      <section className="py-16 md:py-24">
        <div className="container-prose">
          <div className="space-y-20 md:space-y-28">
            {values.map((v, i) => (
              <div
                key={v.title}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="reveal aspect-[4/3] bg-bg-warm border border-border-light rounded-lg overflow-hidden relative hover-zoom">
                  <Image
                    src={v.imageUrl}
                    alt={v.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="reveal">
                  <div className="eyebrow mb-3">0{i + 1}</div>
                  <h2 className="font-serif text-2xl md:text-4xl font-medium leading-tight mb-4">
                    {v.title}
                  </h2>
                  <p className="text-base md:text-lg text-ink-secondary leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bg-cream py-14 md:py-16 border-t border-border-light">
        <div className="container-prose text-center max-w-xl">
          <div className="reveal eyebrow mb-3">Bersama Noblekase</div>
          <h2 className="reveal font-serif text-2xl md:text-3xl font-medium mb-5">
            Mulai dari koleksi atau cerita kami
          </h2>
          <div className="reveal flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/produk"
              className="bg-ink-primary text-bg-base px-6 py-3 rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Lihat semua produk →
            </Link>
            <Link
              href="/journal"
              className="border border-ink-primary text-ink-primary px-6 py-3 rounded-md text-sm font-medium hover:bg-bg-warm transition-colors"
            >
              Baca Journal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
