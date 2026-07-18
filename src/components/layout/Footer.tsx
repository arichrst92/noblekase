/**
 * Footer — logo brand + kolom link (dengan ikon) + legal links.
 * Konten dari global Footer (via props).
 *
 * Ikon: dipilih editor lewat field `icon`, atau ditebak otomatis dari label
 * bila kosong. Untuk marketplace dipakai ikon toko generik — logo resmi
 * Tokopedia/Shopee/dll adalah merek pihak ketiga, jadi jika ingin logo asli
 * silakan unggah berkas resminya (koleksi Marketplaces punya field `icon`).
 *
 * Semua tautan internal (termasuk yang datang dari CMS) dilewatkan localePath()
 * agar pengunjung versi Inggris tetap berada di /en saat berpindah halaman.
 */

import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Music2,
  Store,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  defaultLocale,
  localeHref,
  translator,
  type Locale,
  type Translator,
} from "@/lib/i18n";

interface FooterLink {
  label: string;
  url: string;
  icon?: string;
}
interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brand?: string;
  logoUrl?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyrightText?: string;
  legalLinks?: FooterLink[];
  locale?: Locale;
}

const ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: MessageCircle,
  tiktok: Music2,
  store: Store,
  external: ExternalLink,
};

/** Tebak ikon dari label bila editor belum memilih. */
function inferIcon(label: string): LucideIcon | null {
  const l = label.toLowerCase();
  if (l.includes("instagram")) return Instagram;
  if (l.includes("facebook")) return Facebook;
  if (l.includes("youtube")) return Youtube;
  if (l.includes("twitter") || l === "x") return Twitter;
  if (l.includes("whatsapp") || l.includes("wa")) return MessageCircle;
  if (l.includes("tiktok")) return Music2;
  if (["tokopedia", "shopee", "lazada", "blibli", "bukalapak"].some((m) => l.includes(m)))
    return Store;
  return null;
}

const buildDefaultColumns = (tr: Translator): FooterColumn[] => [
  {
    title: tr("common.products"),
    links: [
      { label: tr("footer.category.chargerPower"), url: "/produk/charger-power" },
      { label: tr("footer.category.cableConnector"), url: "/produk/kabel-konektor" },
      { label: tr("footer.category.holderStand"), url: "/produk/holder-stand" },
      { label: tr("footer.category.audioCase"), url: "/produk/audio-casing" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: tr("nav.about"), url: "/tentang" },
      { label: tr("nav.journal"), url: "/journal" },
      { label: tr("nav.support"), url: "/dukungan" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Tokopedia", url: "https://tokopedia.com/noblekaseid", icon: "store" },
      { label: "Shopee", url: "https://shopee.co.id/noblekaseid", icon: "store" },
      { label: "TikTok Shop", url: "https://tiktok.com/@noblekase", icon: "store" },
      { label: "Lazada", url: "https://lazada.co.id/shop/noblekase", icon: "store" },
    ],
  },
  {
    title: tr("footer.columnSocial"),
    links: [
      { label: "Instagram", url: "https://instagram.com/noblekase", icon: "instagram" },
      { label: "TikTok", url: "https://tiktok.com/@noblekase", icon: "tiktok" },
      { label: "Facebook", url: "https://facebook.com/noblekase.id", icon: "facebook" },
    ],
  },
];

const defaultLegal: FooterLink[] = [
  { label: "Privacy", url: "/privacy" },
  { label: "Terms", url: "/terms" },
  { label: "Sitemap", url: "/sitemap.xml" },
];

export function Footer({
  brand = "NOBLEKASE",
  logoUrl,
  tagline,
  columns,
  copyrightText = "© 2026 Noblekase. All rights reserved.",
  legalLinks,
  locale = defaultLocale,
}: FooterProps) {
  const tr = translator(locale);
  const taglineText = tagline ?? tr("site.taglineFallback");
  const cols = columns && columns.length ? columns : buildDefaultColumns(tr);
  const legal = legalLinks && legalLinks.length ? legalLinks : defaultLegal;

  return (
    <footer className="bg-navy text-bg-base mt-auto">
      <div className="container-prose py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={brand}
                className="h-9 md:h-10 w-auto object-contain mb-5 brightness-0 invert"
              />
            ) : (
              <div className="font-serif text-2xl tracking-[0.15em] mb-4">{brand}</div>
            )}
            <p className="text-sm text-bg-base/75 max-w-xs leading-relaxed">{taglineText}</p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-widest text-bg-base/60 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-bg-base/85">
                {col.links.map((link) => {
                  const Icon = link.icon ? ICONS[link.icon] : inferIcon(link.label);
                  const external = link.url.startsWith("http");
                  return (
                    <li key={link.url + link.label}>
                      <Link
                        href={localeHref(locale, link.url)}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex items-center gap-2 hover:text-accent-light transition-colors"
                      >
                        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" aria-hidden />}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-bg-base/15 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-bg-base/60">
          <span>{copyrightText}</span>
          <div className="flex gap-5">
            {legal.map((l) => (
              <Link
                key={l.url + l.label}
                href={localeHref(locale, l.url)}
                className="hover:text-accent-light"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
