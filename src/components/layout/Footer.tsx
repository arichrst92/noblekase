/**
 * Footer — 4 columns + legal links
 */

import Link from "next/link";

const columns = [
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
      { label: "Kontak", url: "/kontak" },
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

export function Footer() {
  return (
    <footer className="bg-ink-primary text-bg-base mt-auto">
      <div className="container-prose py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="font-serif text-2xl tracking-[0.15em] mb-4">
              NOBLEKASE
            </div>
            <p className="text-sm text-bg-base/75 max-w-xs leading-relaxed">
              Aksesoris yang menemani hari-hari setiap orang. Kualitas konsisten,
              desain editorial untuk semua.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase tracking-widest text-bg-base/60 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-bg-base/85">
                {col.links.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      className="hover:text-accent-light transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-bg-base/15 flex flex-col md:flex-row justify-between gap-3 text-[11px] text-bg-base/60">
          <span>© 2026 Noblekase. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-accent-light">Privacy</Link>
            <Link href="/terms" className="hover:text-accent-light">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-accent-light">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
