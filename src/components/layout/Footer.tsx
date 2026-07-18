/**
 * Footer — 4 columns + legal links. Konten dari global Footer (via props).
 */

import Link from "next/link";

interface FooterLink {
  label: string;
  url: string;
}
interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyrightText?: string;
  legalLinks?: FooterLink[];
}

const defaultColumns: FooterColumn[] = [
  {
    title: "Produk",
    links: [
      { label: "Charger & Power", url: "/produk/charger-power" },
      { label: "Kabel & Konektor", url: "/produk/kabel-konektor" },
      { label: "Holder & Stand", url: "/produk/holder-stand" },
      { label: "Audio & Casing", url: "/produk/audio-casing" },
    ],
  },
  {
    title: "Brand",
    links: [
      { label: "Tentang", url: "/tentang" },
      { label: "Journal", url: "/journal" },
      { label: "Dukungan", url: "/dukungan" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Tokopedia", url: "https://tokopedia.com/noblekaseid" },
      { label: "Shopee", url: "https://shopee.co.id/noblekaseid" },
      { label: "TikTok Shop", url: "https://tiktok.com/@noblekase" },
      { label: "Lazada", url: "https://lazada.co.id/shop/noblekase" },
    ],
  },
  {
    title: "Sosial",
    links: [
      { label: "Instagram", url: "https://instagram.com/noblekase" },
      { label: "TikTok", url: "https://tiktok.com/@noblekase" },
      { label: "Facebook", url: "https://facebook.com/noblekase.id" },
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
  tagline = "Aksesoris yang menemani hari-hari setiap orang. Kualitas konsisten, desain editorial untuk semua.",
  columns,
  copyrightText = "© 2026 Noblekase. All rights reserved.",
  legalLinks,
}: FooterProps) {
  const cols = columns && columns.length ? columns : defaultColumns;
  const legal = legalLinks && legalLinks.length ? legalLinks : defaultLegal;

  return (
    <footer className="bg-navy text-bg-base mt-auto">
      <div className="container-prose py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="font-serif text-2xl tracking-[0.15em] mb-4">{brand}</div>
            <p className="text-sm text-bg-base/75 max-w-xs leading-relaxed">{tagline}</p>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-widest text-bg-base/60 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-bg-base/85">
                {col.links.map((link) => (
                  <li key={link.url + link.label}>
                    <Link href={link.url} className="hover:text-accent-light transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-bg-base/15 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-bg-base/60">
          <span>{copyrightText}</span>
          <div className="flex gap-5">
            {legal.map((l) => (
              <Link key={l.url + l.label} href={l.url} className="hover:text-accent-light">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
