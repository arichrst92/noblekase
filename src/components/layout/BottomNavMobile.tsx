/**
 * BottomNavMobile — floating rounded bottom navigation (mobile only)
 *
 * 5 slots: Beranda · Produk · [N logo center] · Journal · Lainnya
 *
 * Tautan internal dilewatkan localePath() dan status aktif dihitung dari
 * pathname yang sudah dilepas prefix locale-nya.
 */

"use client";

import Link from "next/link";
import {
  Home,
  Grid3x3,
  BookOpen,
  MoreHorizontal,
  Info,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  defaultLocale,
  localeHref,
  stripLocale,
  translator,
  type Locale,
  type Translator,
} from "@/lib/i18n";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  grid: Grid3x3,
  "grid-3x3": Grid3x3,
  "book-open": BookOpen,
  "more-horizontal": MoreHorizontal,
  info: Info,
  "life-buoy": LifeBuoy,
};

interface MobileItem {
  label: string;
  url: string;
  icon?: string;
  isCenterLogo?: boolean;
}

const buildDefaultItems = (tr: Translator): MobileItem[] => [
  { label: tr("nav.home"), url: "/", icon: "home" },
  { label: tr("nav.products"), url: "/produk", icon: "grid" },
  { label: "", url: "#", isCenterLogo: true },
  { label: tr("nav.journal"), url: "/journal", icon: "book-open" },
  { label: tr("nav.more"), url: "#more", icon: "more-horizontal" },
];

export function BottomNavMobile({
  items,
  locale = defaultLocale,
  /**
   * Ikon tombol tengah. Diambil dari Site Settings → Favicon (monogram brand),
   * bukan dari Logo: logo adalah wordmark memanjang dan akan tampak sangat
   * kecil begitu dipaksa masuk lingkaran. Fallback ke berkas statis supaya
   * tombolnya tidak pernah kosong walau CMS belum diisi.
   */
  iconUrl = "/images/brand/favicon-noblekase.png",
}: {
  items?: MobileItem[];
  locale?: Locale;
  iconUrl?: string;
}) {
  const tr = translator(locale);
  /*
   * Sama seperti TopNav: baris berlabel kosong disaring supaya menu tidak
   * tampil blank saat data CMS bermasalah. Baris logo tengah dikecualikan —
   * label kosong di sana memang disengaja.
   */
  const cmsItems = (items ?? []).filter(
    (item) => item.isCenterLogo || item.label?.trim(),
  );
  const hasLabelled = cmsItems.some((item) => !item.isCenterLogo);
  const navItems = hasLabelled ? cmsItems : buildDefaultItems(tr);
  const pathname = usePathname();
  const currentPath = stripLocale(pathname ?? "/").path;

  const isActive = (url: string) =>
    url === "/"
      ? currentPath === "/"
      : url.startsWith("/") && currentPath.startsWith(url);

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50">
      <div className="floating-nav grid grid-cols-[1fr_1fr_0.6fr_1fr_1fr] items-center py-2 px-1">
        {navItems.map((item, i) => {
          if (item.isCenterLogo) {
            return (
              <div key={i} className="flex justify-center">
                <Link
                  href={localeHref(locale, item.url || "/")}
                  /* Tombol ini isinya gambar tanpa teks, jadi butuh nama
                     aksesibel sendiri — label di CMS memang dikosongkan
                     by design untuk baris logo tengah. */
                  aria-label={item.label || tr("nav.home")}
                  className={cn(
                    "inline-flex w-11 h-11 overflow-hidden",
                    "items-center justify-center",
                    "-mt-4 border-[3px] border-bg-base shadow-soft",
                    /* Latar putih: ikon brand sudah membawa bidang oranyenya
                       sendiri, jadi kotak oranye di belakangnya hanya menggandakan
                       warna yang sama. */
                    "rounded-xl bg-bg-base",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconUrl}
                    /* Alt sengaja diisi, bukan dikosongkan: kalau berkasnya
                       gagal dimuat, teks ini muncul sehingga masalahnya
                       kelihatan. Dengan alt kosong, gambar yang 404 tidak
                       meninggalkan jejak apa pun — hanya kotak oranye polos. */
                    alt="Noblekase"
                    className="w-full h-full object-contain p-0.5"
                  />
                </Link>
              </div>
            );
          }

          const Icon = iconMap[item.icon ?? ""] ?? MoreHorizontal;
          const active = isActive(item.url);

          return (
            <Link
              key={i}
              href={localeHref(locale, item.url)}
              className={cn(
                "flex flex-col items-center justify-center py-1 transition-colors",
                active ? "text-ink-primary" : "text-ink-secondary",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span
                className={cn("text-[9px] mt-0.5", active && "font-medium")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
