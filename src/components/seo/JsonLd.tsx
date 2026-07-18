/**
 * JsonLd — structured data (schema.org) untuk Google.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan penting soal Product: rich result produk Google umumnya
 * membutuhkan harga & ketersediaan. Noblekase tidak menjual langsung
 * (pembelian lewat marketplace), jadi kita mengirim data produk tanpa
 * `offers`. Ini tetap membantu Google memahami halaman, tetapi jangan
 * berharap muncul rich snippet harga/rating.
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const abs = (path: string) => (path.startsWith("http") ? path : `${SITE.replace(/\/$/, "")}${path}`);

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Data berasal dari CMS kita sendiri, bukan input publik.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** Organisasi + WebSite (dengan SearchAction ke /cari) — dipasang di layout. */
export function SiteJsonLd({
  siteName = "Noblekase",
  logoUrl,
  socialUrls = [],
}: {
  siteName?: string;
  logoUrl?: string;
  socialUrls?: string[];
}) {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteName,
          url: abs("/"),
          ...(logoUrl ? { logo: abs(logoUrl) } : {}),
          ...(socialUrls.length ? { sameAs: socialUrls } : {}),
        }}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: abs("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: abs("/cari?q={search_term_string}") },
            "query-input": "required name=search_term_string",
          },
        }}
      />
    </>
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: abs(it.path),
        })),
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  imageUrl,
  path,
  category,
  sku,
  brand = "Noblekase",
}: {
  name: string;
  description?: string;
  imageUrl?: string;
  path: string;
  category?: string;
  sku?: string;
  brand?: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        url: abs(path),
        ...(description ? { description } : {}),
        ...(imageUrl ? { image: [abs(imageUrl)] } : {}),
        ...(category ? { category } : {}),
        ...(sku ? { sku } : {}),
        brand: { "@type": "Brand", name: brand },
      }}
    />
  );
}

export function ArticleJsonLd({
  headline,
  description,
  imageUrl,
  path,
  publishedAt,
  siteName = "Noblekase",
}: {
  headline: string;
  description?: string;
  imageUrl?: string;
  path: string;
  publishedAt?: string;
  siteName?: string;
}) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        url: abs(path),
        mainEntityOfPage: abs(path),
        ...(description ? { description } : {}),
        ...(imageUrl ? { image: [abs(imageUrl)] } : {}),
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        author: { "@type": "Organization", name: siteName },
        publisher: { "@type": "Organization", name: siteName },
      }}
    />
  );
}
