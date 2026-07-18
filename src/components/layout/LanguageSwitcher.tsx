/**
 * LanguageSwitcher — tombol ID / EN di navbar.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menukar bahasa TANPA kehilangan halaman: path saat ini dibaca dari
 * usePathname(), prefix locale-nya dibuang, lalu dibangun ulang untuk bahasa
 * tujuan. Query string ikut dibawa supaya filter/urutan/kata kunci pencarian
 * tidak ter-reset saat pengunjung berganti bahasa.
 *
 * Dipakai <Link>, bukan router.push, agar tautan tetap bisa dibuka di tab baru
 * dan mesin pencari melihatnya sebagai tautan biasa ke versi bahasa lain.
 */

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { localeLabel, locales, localePath, stripLocale, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { path } = stripLocale(pathname);
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";

  return (
    /* Tampil juga di mobile: hamburger belum punya menu, dan tanpa ini
       pengunjung mobile sama sekali tidak punya jalan ke versi Inggris
       selain mengetik URL — padahal mayoritas trafik datang dari ponsel. */
    <div
      className="inline-flex items-center bg-bg-warm rounded-full p-0.5"
      role="group"
      aria-label="Pilih bahasa / Choose language"
    >
      {locales.map((l) => {
        const active = l === current;
        return (
          <Link
            key={l}
            href={`${localePath(l, path)}${suffix}`}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
              active
                ? "bg-ink-primary text-bg-base"
                : "text-ink-secondary hover:text-ink-primary",
            )}
          >
            {localeLabel[l]}
          </Link>
        );
      })}
    </div>
  );
}
