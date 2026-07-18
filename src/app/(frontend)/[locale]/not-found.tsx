/**
 * 404 — halaman tidak ditemukan.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Selalu beri jalan keluar: cari, jelajahi produk, atau kembali ke beranda.
 *
 * Catatan dua bahasa: Next TIDAK mengoper `params` ke not-found.tsx, jadi
 * segmen [locale] tidak bisa dibaca lewat props. Solusinya sama seperti di
 * error.tsx — bahasa dibaca dari URL di sisi klien lewat usePathname(),
 * supaya URL /en yang salah tetap menampilkan 404 berbahasa Inggris dengan
 * tautan yang mengembalikan pengunjung ke dalam /en, bukan melemparnya ke
 * versi Indonesia.
 *
 * Konsekuensinya berkas ini jadi client component, sehingga `metadata`
 * statis tidak bisa diekspor dari sini. Judul & noindex-nya ditangani
 * masing-masing halaman yang memanggil notFound() (lihat generateMetadata
 * di [...slug]/page.tsx dan halaman detail lainnya).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchForm } from "@/components/search/SearchForm";
import { localePath, stripLocale, translator } from "@/lib/i18n";

export default function NotFound() {
  const { locale } = stripLocale(usePathname() || "/");
  const tr = translator(locale);

  return (
    <section className="min-h-[70vh] flex items-center py-24">
      <div className="container-prose max-w-xl text-center">
        <div className="eyebrow mb-3">404</div>
        <h1 className="font-serif text-3xl md:text-5xl font-medium leading-tight mb-4 tracking-tight">
          {tr("notFound.heading")}
        </h1>
        <p className="text-ink-secondary leading-relaxed mb-8">{tr("notFound.body")}</p>

        <div className="mb-8 text-left">
          <SearchForm placeholder={tr("notFound.searchPlaceholder")} locale={locale} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={localePath(locale, "/produk")}
            className="bg-accent text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-ink-primary transition-colors"
          >
            {tr("common.viewAllProducts")}
          </Link>
          <Link
            href={localePath(locale, "/")}
            className="border border-ink-primary text-ink-primary px-6 py-3 rounded-md text-sm font-medium hover:bg-bg-warm transition-colors"
          >
            {tr("notFound.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
