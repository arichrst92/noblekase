/**
 * MarketplaceCTA — bar dengan tombol marketplace di akhir Beranda
 */

import Link from "next/link";

interface Marketplace {
  name: string;
  url: string;
}

interface MarketplaceCTAProps {
  eyebrow?: string;
  headline?: string;
  marketplaces?: Marketplace[];
}

const defaultMarketplaces: Marketplace[] = [
  { name: "Tokopedia", url: "https://tokopedia.com/noblekaseid" },
  { name: "Shopee", url: "https://shopee.co.id/noblekaseid" },
  { name: "TikTok", url: "https://tiktok.com/@noblekase" },
  { name: "Lazada", url: "https://lazada.co.id/shop/noblekase" },
];

export function MarketplaceCTA({
  eyebrow = "Dapatkan Di",
  headline = "Beli langsung di marketplace pilihan",
  marketplaces = defaultMarketplaces,
}: MarketplaceCTAProps) {
  return (
    <section className="bg-bg-cream py-12 md:py-14">
      <div className="container-prose">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="reveal">
            <div className="eyebrow mb-1.5">{eyebrow}</div>
            <h2 className="font-serif text-lg md:text-xl font-medium">{headline}</h2>
          </div>

          <div className="reveal grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            {marketplaces.map((m) => (
              <Link
                key={m.name}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-bg-base border border-border-light rounded-md text-sm text-center hover:border-ink-primary hover:bg-bg-warm transition-colors"
              >
                {m.name} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
