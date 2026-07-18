/**
 * TopNav — floating rounded navbar (sticky top)
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Hidden on mobile (replaced by hamburger + bottom nav).
 * Shows brand wordmark, menu links, language toggle, search icon.
 *
 * Semua tautan internal dilewatkan localePath() supaya pengunjung yang sedang
 * membaca versi Inggris tetap berada di /en saat berpindah halaman.
 */

"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { defaultLocale, localePath, translator, type Locale } from "@/lib/i18n";

interface NavItem {
  label: string;
  url: string;
}

interface TopNavProps {
  navItems?: NavItem[];
  brand?: string;
  logoUrl?: string;
  locale?: Locale;
}

export function TopNav({
  navItems,
  brand = "NOBLEKASE",
  logoUrl,
  locale = defaultLocale,
}: TopNavProps) {
  const tr = translator(locale);
  const defaultNavItems: NavItem[] = [
    { label: tr("nav.home"), url: "/" },
    { label: tr("nav.products"), url: "/produk" },
    { label: tr("nav.about"), url: "/tentang" },
    { label: tr("nav.journal"), url: "/journal" },
    { label: tr("nav.support"), url: "/dukungan" },
  ];
  /*
   * Menu dari CMS dipakai hanya bila labelnya benar-benar terisi.
   *
   * Label kosong menghasilkan <li> tanpa teks — navbar terlihat blank padahal
   * datanya "ada". Ini pernah terjadi ketika terjemahan menimpa label bahasa
   * Indonesia. Menyaring di sini membuat tampilan tidak pernah bergantung pada
   * kondisi data CMS: kalau semua label kosong, menu bawaan (dari kamus i18n)
   * yang dipakai, dan pengunjung tetap punya navigasi.
   */
  const cmsItems = (navItems ?? []).filter((item) => item.label?.trim());
  const items = cmsItems.length ? cmsItems : defaultNavItems;
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto max-w-[95vw]">
      <nav
        className={cn(
          "floating-nav flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2.5 md:py-3",
          "transition-all duration-300",
          scrolled && "shadow-lift backdrop-blur-md bg-bg-base/95",
        )}
      >
        {/* Mobile: hamburger + brand + search */}
        <button className="md:hidden p-1" aria-label={tr("nav.openMenu")}>
          <Menu className="w-4 h-4 text-ink-primary" />
        </button>

        <Link
          href={localePath(locale, "/")}
          className="flex items-center"
          aria-label={brand}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={brand}
              className="h-8 md:h-9 w-auto object-contain"
            />
          ) : (
            <span className="font-serif font-medium tracking-[0.15em] text-[13px] md:text-sm text-ink-primary">
              {brand}
            </span>
          )}
        </Link>

        {/* Desktop: nav links */}
        <ul className="hidden md:flex items-center gap-4 text-[12px] text-ink-secondary">
          {items.map((item) => (
            <li key={item.url}>
              <Link
                href={localePath(locale, item.url)}
                className="hover:text-ink-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 ml-auto md:ml-2">
          {/* Suspense wajib: LanguageSwitcher memakai useSearchParams, dan tanpa
              batas Suspense Next akan menggagalkan prerender halaman. */}
          <Suspense fallback={<span className="inline-flex w-[52px]" />}>
            <LanguageSwitcher current={locale} />
          </Suspense>
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1.5 md:px-2.5 md:py-1 md:bg-bg-warm md:rounded-full text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label={tr("nav.search")}
            aria-haspopup="dialog"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        locale={locale}
      />
    </header>
  );
}
