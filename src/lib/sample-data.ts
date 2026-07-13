/**
 * sample-data.ts — Single source of truth untuk semua konten showcase
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan: data ini bersifat sementara (showcase phase). Di Phase 2,
 * fetch akan dipindahkan ke Payload CMS. Struktur di sini mengikuti
 * shape Payload collections supaya migrasi nanti minim refactor.
 */

// ============================================
// TYPES
// ============================================

export interface SampleCategory {
  slug: string;
  name: string;
  description: string;
  productCount: number;
  imageUrl: string;
}

export interface SampleMarketplace {
  key: string;          // tokopedia / shopee / tiktok / lazada
  name: string;
  url: string;
  badge?: "best-price" | "fast-ship" | "new";
}

export interface SampleProduct {
  slug: string;
  name: string;
  tagline: string;
  categorySlug: string;
  category: string;
  imageUrl: string;
  gallery: string[];
  lifestyle?: string[];
  badge?: "NEW" | "BEST" | "PRO";
  story: string;
  specs: { label: string; value: string }[];
  marketplaces: SampleMarketplace[];
  related?: string[];   // related product slugs
}

export interface SampleArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  publishedAt: string;
  coverUrl: string;
  heroUrl?: string;
  body: { type: "p" | "h2" | "quote" | "img"; text?: string; src?: string }[];
}

export interface SampleHeroEdition {
  isActive: boolean;
  eyebrow: string;
  headline: string;
  subheadline: string;
  imageUrlDesktop: string;
  imageUrlMobile: string;
  ctaLabel: string;
  ctaUrl: string;
}

// ============================================
// HERO EDITION (active)
// ============================================

export const heroEdition: SampleHeroEdition = {
  isActive: true,
  eyebrow: "Edisi · Mei 2026",
  headline: "Aksesoris yang menemani hari-hari setiap orang.",
  subheadline:
    "Kualitas konsisten. Desain yang tidak biasa. Tersedia untuk semua.",
  imageUrlDesktop: "/images/hero/hero-edisi-01-desktop.svg",
  imageUrlMobile: "/images/hero/hero-edisi-01-mobile.svg",
  ctaLabel: "Jelajahi produk",
  ctaUrl: "/produk",
};

// ============================================
// CATEGORIES (4)
// ============================================

export const categories: SampleCategory[] = [
  {
    slug: "charger-power",
    name: "Charger & Power",
    description:
      "Charger GaN cepat, powerbank ringkas, dan adaptor harian yang awet dipakai.",
    productCount: 4,
    imageUrl: "/images/kategori/kategori-charger-power.svg",
  },
  {
    slug: "kabel-konektor",
    name: "Kabel & Konektor",
    description:
      "Kabel braided, konektor multi-port, dan hub praktis untuk setup mobile.",
    productCount: 4,
    imageUrl: "/images/kategori/kategori-kabel-konektor.svg",
  },
  {
    slug: "holder-stand",
    name: "Holder & Stand",
    description:
      "Holder meja, mount mobil, dan tripod yang stabil untuk produktivitas.",
    productCount: 4,
    imageUrl: "/images/kategori/kategori-holder-stand.svg",
  },
  {
    slug: "audio-casing",
    name: "Audio & Casing",
    description:
      "Earbuds, speaker, dan casing dengan finishing yang dipikirkan baik-baik.",
    productCount: 4,
    imageUrl: "/images/kategori/kategori-audio-casing.svg",
  },
];

// ============================================
// MARKETPLACES (global config)
// ============================================

export const allMarketplaces: SampleMarketplace[] = [
  { key: "tokopedia", name: "Tokopedia", url: "https://tokopedia.com/noblekaseid", badge: "best-price" },
  { key: "shopee", name: "Shopee", url: "https://shopee.co.id/noblekaseid", badge: "fast-ship" },
  { key: "tiktok", name: "TikTok Shop", url: "https://tiktok.com/@noblekase" },
  { key: "lazada", name: "Lazada", url: "https://lazada.co.id/shop/noblekase" },
];

// ============================================
// PRODUCTS (16 — 4 per kategori)
// ============================================

const defaultMP = allMarketplaces;

export const products: SampleProduct[] = [
  // ---- Charger & Power ----
  {
    slug: "pulse-30w",
    name: "Pulse 30W GaN Charger",
    tagline: "Cepat, ringkas, satu colokan untuk semua",
    categorySlug: "charger-power",
    category: "Charger & Power",
    imageUrl: "/images/produk/p-charger-01-pulse-30w.svg",
    gallery: [
      "/images/produk-detail/detail-pulse30w-01-hero.svg",
      "/images/produk-detail/detail-pulse30w-02-side.svg",
      "/images/produk-detail/detail-pulse30w-03-back.svg",
      "/images/produk-detail/detail-pulse30w-04-detail.svg",
      "/images/produk-detail/detail-pulse30w-05-incase.svg",
    ],
    lifestyle: [
      "/images/produk-detail/lifestyle-01-desk.svg",
      "/images/produk-detail/lifestyle-02-travel.svg",
      "/images/produk-detail/lifestyle-03-bedside.svg",
      "/images/produk-detail/lifestyle-04-cafe.svg",
    ],
    badge: "BEST",
    story:
      "Pulse 30W dirancang untuk diam-diam menjadi bagian dari hari Anda. Berbahan PC tahan panas dengan finishing matte yang nyaman dipegang, ukurannya cukup ringkas untuk masuk ke saku celana, namun cukup bertenaga untuk mengisi laptop ringan, tablet, atau ponsel terkini.",
    specs: [
      { label: "Output Daya", value: "30W (USB-C PD 3.0)" },
      { label: "Port", value: "1× USB-C" },
      { label: "Teknologi", value: "GaN II" },
      { label: "Input", value: "100-240V AC, 50/60 Hz" },
      { label: "Berat", value: "62 g" },
      { label: "Dimensi", value: "44 × 38 × 30 mm" },
      { label: "Sertifikasi", value: "PSE, CE, FCC" },
    ],
    marketplaces: defaultMP,
    related: ["pulse-65w", "kabel-usbc-1m", "bank-10k"],
  },
  {
    slug: "pulse-65w",
    name: "Pulse 65W Dual USB-C",
    tagline: "Dua perangkat, satu adaptor",
    categorySlug: "charger-power",
    category: "Charger & Power",
    imageUrl: "/images/produk/p-charger-02-pulse-65w.svg",
    gallery: ["/images/produk/p-charger-02-pulse-65w.svg"],
    badge: "PRO",
    story:
      "Untuk Anda yang membawa laptop dan ponsel ke mana saja, Pulse 65W mengisi dua perangkat secara bersamaan tanpa kompromi kecepatan.",
    specs: [
      { label: "Output Daya", value: "65W total (PD 3.0)" },
      { label: "Port", value: "2× USB-C" },
      { label: "Teknologi", value: "GaN II" },
      { label: "Berat", value: "118 g" },
    ],
    marketplaces: defaultMP,
    related: ["pulse-30w", "bank-20k"],
  },
  {
    slug: "bank-10k",
    name: "Powerbank 10.000 mAh",
    tagline: "Pas di telapak, cukup untuk seharian",
    categorySlug: "charger-power",
    category: "Charger & Power",
    imageUrl: "/images/produk/p-power-03-bank-10k.svg",
    gallery: ["/images/produk/p-power-03-bank-10k.svg"],
    story:
      "Cukup kompak untuk dimasukkan ke tas kerja atau saku jaket, dengan dua port USB-C agar bisa charge dua perangkat sekaligus.",
    specs: [
      { label: "Kapasitas", value: "10.000 mAh" },
      { label: "Output", value: "USB-C PD 22.5W, USB-A QC 18W" },
      { label: "Berat", value: "198 g" },
    ],
    marketplaces: defaultMP,
    related: ["bank-20k", "pulse-30w"],
  },
  {
    slug: "bank-20k",
    name: "Powerbank 20.000 mAh",
    tagline: "Untuk perjalanan panjang & oncall",
    categorySlug: "charger-power",
    category: "Charger & Power",
    imageUrl: "/images/produk/p-power-04-bank-20k.svg",
    gallery: ["/images/produk/p-power-04-bank-20k.svg"],
    badge: "NEW",
    story:
      "Kapasitas besar untuk multi-day trip, tetap ringan berkat sel baterai high-density.",
    specs: [
      { label: "Kapasitas", value: "20.000 mAh" },
      { label: "Output", value: "USB-C PD 45W, USB-A QC 18W" },
      { label: "Berat", value: "388 g" },
    ],
    marketplaces: defaultMP,
    related: ["bank-10k"],
  },

  // ---- Kabel & Konektor ----
  {
    slug: "kabel-usbc-1m",
    name: "Kabel USB-C 100W 1m",
    tagline: "Anyaman nylon, kepala aluminium",
    categorySlug: "kabel-konektor",
    category: "Kabel & Konektor",
    imageUrl: "/images/produk/p-kabel-05-usbc-1m.svg",
    gallery: ["/images/produk/p-kabel-05-usbc-1m.svg"],
    story:
      "Dirancang untuk tahan lebih dari 30.000 kali bending. Anyaman nylon braided yang tidak mudah kusut.",
    specs: [
      { label: "Panjang", value: "1 meter" },
      { label: "Daya Maks", value: "100W (5A)" },
      { label: "Transfer Data", value: "USB 2.0, 480 Mbps" },
    ],
    marketplaces: defaultMP,
    related: ["kabel-usbc-2m", "kabel-lightning"],
  },
  {
    slug: "kabel-usbc-2m",
    name: "Kabel USB-C 100W 2m",
    tagline: "Lebih leluasa untuk setup meja",
    categorySlug: "kabel-konektor",
    category: "Kabel & Konektor",
    imageUrl: "/images/produk/p-kabel-06-usbc-2m.svg",
    gallery: ["/images/produk/p-kabel-06-usbc-2m.svg"],
    story:
      "Panjang ideal untuk charge ponsel dari powerbank di tas atau kabel monitor portable.",
    specs: [
      { label: "Panjang", value: "2 meter" },
      { label: "Daya Maks", value: "100W (5A)" },
    ],
    marketplaces: defaultMP,
    related: ["kabel-usbc-1m"],
  },
  {
    slug: "kabel-lightning",
    name: "Kabel Lightning MFi 1m",
    tagline: "Sertifikasi MFi, aman untuk iPhone",
    categorySlug: "kabel-konektor",
    category: "Kabel & Konektor",
    imageUrl: "/images/produk/p-kabel-07-lightning.svg",
    gallery: ["/images/produk/p-kabel-07-lightning.svg"],
    story:
      "Disertifikasi MFi (Made for iPhone) jadi tidak pernah muncul peringatan kompatibilitas.",
    specs: [
      { label: "Panjang", value: "1 meter" },
      { label: "Sertifikasi", value: "MFi by Apple" },
    ],
    marketplaces: defaultMP,
    related: ["kabel-usbc-1m"],
  },
  {
    slug: "hub-usbc-7in1",
    name: "USB-C Hub 7-in-1",
    tagline: "HDMI 4K, dua USB, SD/microSD, PD",
    categorySlug: "kabel-konektor",
    category: "Kabel & Konektor",
    imageUrl: "/images/produk/p-konektor-08-hub.svg",
    gallery: ["/images/produk/p-konektor-08-hub.svg"],
    story:
      "Solusi all-in-one untuk laptop & tablet dengan port terbatas. Output HDMI 4K @ 60Hz.",
    specs: [
      { label: "Port", value: "HDMI 4K, 2× USB-A, USB-C PD, SD, microSD" },
      { label: "Material", value: "Aluminium brushed" },
    ],
    marketplaces: defaultMP,
    related: ["kabel-usbc-1m"],
  },

  // ---- Holder & Stand ----
  {
    slug: "desk-stand",
    name: "Desk Stand Aluminium",
    tagline: "Posisi ideal untuk video call & baca",
    categorySlug: "holder-stand",
    category: "Holder & Stand",
    imageUrl: "/images/produk/p-holder-09-desk.svg",
    gallery: ["/images/produk/p-holder-09-desk.svg"],
    story:
      "Desain minimalis dengan finishing brushed aluminium. Sudut bisa diatur 15°–60°.",
    specs: [
      { label: "Material", value: "Aluminium 6061" },
      { label: "Kompatibel", value: "Ponsel & tablet hingga 12.9 inci" },
    ],
    marketplaces: defaultMP,
    related: ["car-mount", "magsafe-mount"],
  },
  {
    slug: "car-mount",
    name: "Car Mount Magnetic",
    tagline: "Genggam aman di vent AC",
    categorySlug: "holder-stand",
    category: "Holder & Stand",
    imageUrl: "/images/produk/p-holder-10-car.svg",
    gallery: ["/images/produk/p-holder-10-car.svg"],
    story:
      "Magnet N52 kuat untuk casing MagSafe. Klip vent berlapis silikon agar tidak merusak AC.",
    specs: [
      { label: "Tipe", value: "Magnetic MagSafe-compatible" },
      { label: "Pasangan", value: "Klip vent" },
    ],
    marketplaces: defaultMP,
    related: ["magsafe-mount"],
  },
  {
    slug: "magsafe-mount",
    name: "MagSafe Desk Mount",
    tagline: "Charging sambil berdiri di meja",
    categorySlug: "holder-stand",
    category: "Holder & Stand",
    imageUrl: "/images/produk/p-holder-11-magsafe.svg",
    gallery: ["/images/produk/p-holder-11-magsafe.svg"],
    badge: "NEW",
    story:
      "Stand magnetik untuk iPhone dengan input USB-C 15W. Posisi vertikal & horizontal.",
    specs: [
      { label: "Daya", value: "MagSafe 15W (PD input)" },
      { label: "Kompatibel", value: "iPhone 12+" },
    ],
    marketplaces: defaultMP,
    related: ["desk-stand", "car-mount"],
  },
  {
    slug: "tripod-mini",
    name: "Tripod Mini Foldable",
    tagline: "Ringkas, kokoh, untuk solo creator",
    categorySlug: "holder-stand",
    category: "Holder & Stand",
    imageUrl: "/images/produk/p-holder-12-tripod.svg",
    gallery: ["/images/produk/p-holder-12-tripod.svg"],
    story:
      "Foldable tripod dengan ball-head untuk ponsel & kamera ringan. Kaki anti-slip.",
    specs: [
      { label: "Tinggi", value: "12–24 cm" },
      { label: "Beban Maks", value: "1.5 kg" },
    ],
    marketplaces: defaultMP,
    related: ["desk-stand"],
  },

  // ---- Audio & Casing ----
  {
    slug: "earbuds-pro",
    name: "Earbuds Pro ANC",
    tagline: "Noise cancelling untuk perjalanan",
    categorySlug: "audio-casing",
    category: "Audio & Casing",
    imageUrl: "/images/produk/p-audio-13-earbuds.svg",
    gallery: ["/images/produk/p-audio-13-earbuds.svg"],
    badge: "PRO",
    story:
      "Driver dinamik 11mm, ANC hingga -38dB, baterai 8 jam (case 32 jam). Codec LDAC + AAC.",
    specs: [
      { label: "Driver", value: "11 mm dynamic" },
      { label: "ANC", value: "Hingga -38 dB" },
      { label: "Baterai", value: "8 jam (32 jam dengan case)" },
      { label: "Codec", value: "LDAC, AAC, SBC" },
    ],
    marketplaces: defaultMP,
    related: ["speaker-mini", "casing-leather"],
  },
  {
    slug: "speaker-mini",
    name: "Speaker Mini Bluetooth",
    tagline: "Untuk teman kerja & piknik kecil",
    categorySlug: "audio-casing",
    category: "Audio & Casing",
    imageUrl: "/images/produk/p-audio-14-speaker.svg",
    gallery: ["/images/produk/p-audio-14-speaker.svg"],
    story:
      "IP67, 10W output, baterai 16 jam. Strap karabiner untuk gantung di tas.",
    specs: [
      { label: "Output", value: "10W RMS" },
      { label: "Baterai", value: "16 jam" },
      { label: "Rating", value: "IP67 (waterproof)" },
    ],
    marketplaces: defaultMP,
    related: ["earbuds-pro"],
  },
  {
    slug: "casing-clear",
    name: "Casing Clear Hybrid",
    tagline: "Anti kuning, tetap menampilkan warna asli",
    categorySlug: "audio-casing",
    category: "Audio & Casing",
    imageUrl: "/images/produk/p-casing-15-clear.svg",
    gallery: ["/images/produk/p-casing-15-clear.svg"],
    story:
      "Bahan TPU + PC dengan UV coating supaya tidak menguning. Drop tested 2 meter.",
    specs: [
      { label: "Material", value: "TPU + PC dengan UV coating" },
      { label: "Drop Protection", value: "2 meter (MIL-STD-810G)" },
    ],
    marketplaces: defaultMP,
    related: ["casing-leather"],
  },
  {
    slug: "casing-leather",
    name: "Casing Leather Magnetic",
    tagline: "Kulit asli, finishing premium",
    categorySlug: "audio-casing",
    category: "Audio & Casing",
    imageUrl: "/images/produk/p-casing-16-leather.svg",
    gallery: ["/images/produk/p-casing-16-leather.svg"],
    badge: "NEW",
    story:
      "Genuine top-grain leather dengan magnet ring untuk MagSafe accessories.",
    specs: [
      { label: "Material", value: "Top-grain leather" },
      { label: "Magnet", value: "MagSafe-compatible" },
    ],
    marketplaces: defaultMP,
    related: ["casing-clear", "earbuds-pro"],
  },
];

// ============================================
// FEATURED COLLECTION (for Beranda)
// ============================================

export const featuredCollection = {
  eyebrow: "Cerita Edisi Ini",
  headline: "Untuk Pekerja Mobile",
  subheadline: "Koleksi pilihan untuk teman bekerja di mana saja",
  mainProductSlug: "pulse-65w",
  secondaryProductSlugs: ["kabel-usbc-1m", "magsafe-mount"] as const,
};

// ============================================
// ARTICLES (8)
// ============================================

export const articles: SampleArticle[] = [
  {
    slug: "memilih-charger-gan",
    title: "Memilih charger GaN untuk traveler",
    excerpt:
      "Panduan singkat memilih charger yang ringkas tapi cukup bertenaga untuk semua perangkat Anda.",
    category: "Panduan",
    readingTime: 5,
    publishedAt: "2026-04-28",
    coverUrl: "/images/journal/journal-cover-01-charger-traveler.svg",
    heroUrl: "/images/journal/article-detail-hero-sample.svg",
    body: [
      { type: "p", text: "Saat bepergian, jumlah dan jenis perangkat yang dibawa berbeda-beda. Untuk yang membawa laptop, ponsel, dan earbuds — total kebutuhan daya bisa mencapai 65W." },
      { type: "h2", text: "Kenapa GaN?" },
      { type: "p", text: "Gallium Nitride (GaN) memungkinkan adaptor dibuat 40-50% lebih kecil dibanding silikon konvensional, dengan efisiensi panas yang lebih baik." },
      { type: "img", src: "/images/journal/article-inline-01.svg" },
      { type: "p", text: "Untuk traveler harian, 30-45W sudah cukup. Untuk yang sering kerja dari kafe & co-working, 65W dual-port lebih fleksibel." },
      { type: "quote", text: "Bawa adaptor yang sesuai kebutuhan harian — bukan yang paling besar." },
      { type: "p", text: "Pertimbangkan juga panjang kabel: untuk hotel/kafe, kabel 1.5-2 meter memberikan keleluasaan lebih." },
    ],
  },
  {
    slug: "merawat-kabel-anti-rusak",
    title: "Merawat kabel anti-rusak: kebiasaan kecil yang membantu",
    excerpt:
      "Trik sederhana memperpanjang umur kabel braided & lightning Anda.",
    category: "Tips",
    readingTime: 3,
    publishedAt: "2026-04-15",
    coverUrl: "/images/journal/journal-cover-02-cable-care.svg",
    body: [
      { type: "p", text: "Kabel sering rusak bukan karena mutu rendah, tapi karena bending yang berulang di area konektor." },
      { type: "h2", text: "Aturan praktis" },
      { type: "p", text: "Cabut dari kepala konektor, bukan ditarik dari kabelnya. Lipatan rapi di tas, bukan dililit ketat." },
      { type: "img", src: "/images/journal/article-inline-02.svg" },
    ],
  },
  {
    slug: "setup-meja-3x3",
    title: "Setup meja 3×3: minimalis untuk pekerja remote",
    excerpt:
      "Tiga rak vertikal, tiga zona horizontal — formula simpel untuk meja yang tidak mengganggu fokus.",
    category: "Inspirasi",
    readingTime: 4,
    publishedAt: "2026-04-02",
    coverUrl: "/images/journal/journal-cover-03-workspace-3x3.svg",
    body: [
      { type: "p", text: "Pembagian 3×3 (tiga lapis kedalaman × tiga zona kiri-tengah-kanan) bikin meja terasa terorganisir tanpa harus banyak laci." },
    ],
  },
  {
    slug: "magsafe-explained",
    title: "MagSafe dijelaskan: bukan sekadar magnet",
    excerpt:
      "Mengapa charging magnetik 15W bisa lebih nyaman daripada wireless Qi biasa.",
    category: "Edukasi",
    readingTime: 4,
    publishedAt: "2026-03-20",
    coverUrl: "/images/journal/journal-cover-04-magsafe-explained.svg",
    body: [
      { type: "p", text: "MagSafe menggunakan array magnet yang menjamin alignment dengan coil pengisi daya — efisiensi naik, panas turun." },
    ],
  },
  {
    slug: "audio-untuk-keseharian",
    title: "Audio untuk keseharian: codec, ANC, dan kompromi",
    excerpt:
      "Memilih earbuds yang cocok untuk commute, kerja, dan olahraga — tanpa kompromi yang membayangkan.",
    category: "Panduan",
    readingTime: 6,
    publishedAt: "2026-03-08",
    coverUrl: "/images/journal/journal-cover-05-audio-everyday.svg",
    body: [
      { type: "p", text: "LDAC memberikan bitrate tertinggi di Android. AAC adalah default Apple yang cukup untuk kebanyakan kebutuhan." },
    ],
  },
  {
    slug: "edisi-01-behind-the-scene",
    title: "Edisi 01: di balik layar pemotretan",
    excerpt:
      "Bagaimana kami memilih lokasi & properti untuk edisi pertama Noblekase.",
    category: "Cerita",
    readingTime: 4,
    publishedAt: "2026-02-22",
    coverUrl: "/images/journal/journal-cover-06-edisi-01-bts.svg",
    body: [
      { type: "p", text: "Setiap edisi punya cerita tersendiri. Edisi 01 mengambil mood pagi cerah dengan palet cream-navy." },
    ],
  },
  {
    slug: "mitos-charging",
    title: "Lima mitos tentang charging yang sebaiknya dilupakan",
    excerpt:
      "Charging semalaman merusak baterai? Cas sampai 100% mempercepat aus? Mari diluruskan.",
    category: "Edukasi",
    readingTime: 5,
    publishedAt: "2026-02-05",
    coverUrl: "/images/journal/journal-cover-07-charging-myths.svg",
    body: [
      { type: "p", text: "Lithium-ion modern punya manajemen daya yang akan trickle-charge saat baterai penuh — tidak akan overcharge." },
    ],
  },
  {
    slug: "packaging-ramah-lingkungan",
    title: "Packaging ramah lingkungan: pilihan kami",
    excerpt:
      "Mengapa Noblekase memilih kertas FSC tanpa plastik, dan trade-off yang menyertainya.",
    category: "Cerita",
    readingTime: 4,
    publishedAt: "2026-01-19",
    coverUrl: "/images/journal/journal-cover-08-eco-packaging.svg",
    body: [
      { type: "p", text: "Plastik shrink-wrap praktis, tapi tidak ramah lingkungan. Kami pilih kertas FSC yang dapat di-daur ulang." },
    ],
  },
];

// ============================================
// HELPERS
// ============================================

export function getProductBySlug(slug: string): SampleProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): SampleProduct[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): SampleCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getArticleBySlug(slug: string): SampleArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedProducts(slugs: string[] = []): SampleProduct[] {
  return slugs
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is SampleProduct => Boolean(p));
}
