/**
 * 404 — halaman tidak ditemukan.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Selalu beri jalan keluar: cari, jelajahi produk, atau kembali ke beranda.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/components/search/SearchForm";

export const metadata: Metadata = {
  title: "Halaman tidak ditemukan",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-xl text-center">
        <div className="eyebrow mb-3">404</div>
        <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
          Halaman ini tidak ada
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">
          Mungkin tautannya sudah berubah, atau ada salah ketik. Coba cari, atau mulai dari
          koleksi kami.
        </p>

        <div className="mb-8 text-left">
          <SearchForm placeholder="Cari produk atau artikel…" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/produk"
            className="bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
          >
            Lihat semua produk
          </Link>
          <Link
            href="/"
            className="border border-ink-primary text-ink-primary px-6 py-3 rounded-md text-sm font-medium hover:bg-bg-warm transition-colors"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </section>
  );
}
