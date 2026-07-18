/**
 * i18n.ts — fondasi dua bahasa (ID / EN) untuk frontend.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Strategi URL: Bahasa Indonesia adalah default dan TIDAK memakai prefix
 * ("/produk"), sedangkan Inggris memakai prefix ("/en/produk"). Middleware
 * (src/middleware.ts) menulis ulang path tanpa prefix ke segmen [locale]
 * internal, jadi URL yang dilihat pengunjung tetap bersih.
 *
 * Alasan memakai prefix path, bukan cookie: setiap bahasa perlu URL sendiri
 * agar Google bisa mengindeks keduanya, hreflang bisa dipasang, dan tautan
 * bisa dibagikan tanpa kehilangan bahasa.
 *
 * Kode locale di sini SENGAJA sama persis dengan kode locale Payload
 * (lihat localization di src/payload.config.ts) sehingga nilainya bisa
 * langsung dioper ke payload.find({ locale }).
 */

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "id";

/** Kode BCP-47 untuk atribut <html lang> dan Intl.DateTimeFormat. */
export const htmlLang: Record<Locale, string> = { id: "id-ID", en: "en-US" };

/** Kode Open Graph (og:locale). */
export const ogLocale: Record<Locale, string> = { id: "id_ID", en: "en_US" };

/** Label yang ditampilkan di tombol pemilih bahasa. */
export const localeLabel: Record<Locale, string> = { id: "ID", en: "EN" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Bangun path untuk sebuah locale.
 * localePath("id", "/produk") → "/produk"
 * localePath("en", "/produk") → "/en/produk"
 * localePath("en", "/")       → "/en"
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Versi aman untuk URL yang datang dari CMS atau rich text editor.
 *
 * Hanya path internal yang diberi prefix. Yang dilewati:
 *   - URL eksternal & protokol lain (https:, mailto:, tel:, wa.me, //cdn…)
 *   - jangkar (#faq) dan query murni (?sort=…)
 *   - berkas statis (/sitemap.xml, /brosur.pdf) — memberi prefix ke berkas
 *     akan membuatnya 404 karena berkas tidak ada di bawah /en
 */
export function localeHref(locale: Locale, url: string): string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return url;
  const pathOnly = url.split(/[?#]/)[0];
  if (/\.[a-z0-9]+$/i.test(pathOnly)) return url;
  return localePath(locale, url);
}

/**
 * Pisahkan prefix locale dari sebuah pathname.
 * "/en/produk" → { locale: "en", path: "/produk" }
 * "/produk"    → { locale: "id", path: "/produk" }
 */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && isLocale(segments[0])) {
    const locale = segments[0] as Locale;
    const rest = `/${segments.slice(1).join("/")}`;
    return { locale, path: rest === "/" ? "/" : rest.replace(/\/$/, "") };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

// ------------------------------------------------------------------
// Kamus string UI
//
// Hanya untuk teks yang di-hardcode di komponen. Teks yang dikelola
// editor tetap datang dari CMS (field-nya sudah `localized: true`),
// nilai di sini dipakai sebagai fallback ketika field CMS masih kosong.
// ------------------------------------------------------------------

const id = {
  // Umum
  "common.home": "Beranda",
  "common.products": "Produk",
  "common.categories": "Kategori",
  "common.journal": "Journal",
  "common.close": "Tutup",
  "common.viewAll": "Lihat semua →",
  "common.viewAllProducts": "Lihat semua produk",
  "common.minutesShort": "mnt",
  "common.imagePlaceholder": "gambar",
  "common.productsSuffix": "produk",

  // Navigasi
  "nav.home": "Beranda",
  "nav.products": "Produk",
  "nav.about": "Tentang",
  "nav.journal": "Journal",
  "nav.support": "Dukungan",
  "nav.more": "Lainnya",
  "nav.openMenu": "Buka menu",
  "nav.search": "Cari",
  "nav.switchLanguage": "Ganti bahasa",

  // Footer
  "footer.columnSocial": "Sosial",
  "footer.category.chargerPower": "Charger & Power",
  "footer.category.cableConnector": "Kabel & Konektor",
  "footer.category.holderStand": "Holder & Stand",
  "footer.category.audioCase": "Audio & Casing",

  // Situs
  "site.taglineFallback": "Aksesoris yang menemani hari-hari setiap orang",
  "site.metaDescriptionFallback":
    "Brand aksesoris HP yang mengedepankan kualitas konsisten dan desain editorial untuk semua kalangan.",

  // Halaman error & 404
  "error.eyebrow": "Ada gangguan",
  "error.heading": "Maaf, halaman ini gagal dimuat",
  "error.body":
    "Gangguan sementara di sisi kami. Coba muat ulang — kalau masih bermasalah, hubungi kami lewat halaman Dukungan.",
  "error.retry": "Coba lagi",
  "error.contactSupport": "Hubungi Dukungan",
  "error.referenceCode": "Kode rujukan:",
  "notFound.metaTitle": "Halaman tidak ditemukan",
  "notFound.heading": "Halaman ini tidak ada",
  "notFound.body":
    "Mungkin tautannya sudah berubah, atau ada salah ketik. Coba cari, atau mulai dari koleksi kami.",
  "notFound.searchPlaceholder": "Cari produk atau artikel…",
  "notFound.backHome": "Kembali ke beranda",

  // Pencarian
  "search.metaTitle": "Pencarian",
  "search.metaTitleWithQuery": "Pencarian: {query}",
  "search.metaDescription": "Cari produk, artikel, dan kategori Noblekase.",
  "search.eyebrow": "Pencarian",
  "search.resultsFor": "Hasil untuk “{query}”",
  "search.headingEmpty": "Cari produk & cerita",
  "search.countFound": "{count} hasil ditemukan",
  "search.noMatch": "Tidak ada hasil yang cocok",
  "search.minChars": "Ketik minimal 2 huruf untuk mulai mencari.",
  "search.hintExamples": "Coba kata seperti charger, kabel, earbuds, atau casing.",
  "search.emptyHeading": "Belum ada yang cocok",
  "search.emptyBody": "Coba kata kunci lain, atau jelajahi koleksi lengkap kami.",
  "search.productCount": "{count} produk",
  "search.articleCount": "{count} artikel",
  "search.placeholder": "Cari produk, kategori, atau artikel…",
  "search.inputAriaLabel": "Kata kunci pencarian",
  "search.submit": "Cari",
  "search.dialogAriaLabel": "Pencarian",
  "search.closeOverlay": "Tutup pencarian",
  "search.overlayMinChars": "Ketik minimal 2 huruf…",
  "search.loading": "Mencari…",
  "search.overlayNoResults": "Tidak ada hasil.",
  "search.viewAllResults": "Lihat semua hasil untuk “{query}” →",

  // Dukungan
  "support.metaTitle": "Dukungan",
  "support.metaDescription":
    "Hubungi tim Noblekase via WhatsApp, Instagram, atau email. Lihat FAQ untuk pertanyaan umum.",
  "support.eyebrow": "Dukungan",
  "support.heading": "Bantu kami menjawab Anda",
  "support.intro":
    "Tim kecil yang membaca semua pesan. Cara tercepat lewat WhatsApp di jam kerja, atau DM Instagram kapan saja.",
  "support.heroImageAlt": "Kontak Noblekase",
  "support.channelsEyebrow": "Kanal",
  "support.channelsHeading": "Pilih cara yang paling nyaman",
  "support.faqEyebrow": "FAQ",
  "support.faqHeading": "Pertanyaan yang sering ditanyakan",

  // Journal
  "journal.metaTitle": "Journal",
  "journal.metaDescription":
    "Cerita, panduan, dan inspirasi dari Noblekase — seputar aksesoris HP dan keseharian.",
  "journal.countTemplate": "{count} cerita",
  "journal.eyebrow": "Journal",
  "journal.heading": "Cerita & panduan dari Noblekase",
  "journal.intro":
    "Mengupas pelan-pelan: cara memilih charger yang pas, alasan kami memilih kertas FSC, dan cerita di balik setiap edisi.",
  "journal.highlightLabel": "Sorotan",
  "journal.readMore": "Baca selengkapnya →",
  "journal.allArticlesEyebrow": "Semua Artikel",
  "journalTeaser.eyebrow": "Dari Journal",
  "journalTeaser.headline": "Cerita & panduan terbaru",

  // Artikel
  "article.notFoundTitle": "Artikel tidak ditemukan",
  "article.relatedHeadingTemplate": "Cerita lain dari {category}",
  "article.readingTimeUnit": "mnt baca",
  "article.backToJournal": "← Kembali ke Journal",
  "article.shareLabel": "Bagikan:",
  "article.relatedEyebrow": "Artikel terkait",

  // Listing produk
  "products.metaTitle": "Produk",
  "products.metaDescription":
    "Jelajahi koleksi aksesoris Noblekase: charger GaN, kabel, holder, audio, dan casing.",
  "products.eyebrow": "Koleksi",
  "products.heading": "Semua produk Noblekase",
  "products.intro":
    "Empat kategori yang menemani hari-hari Anda. Harga ada di marketplace pilihan — kami menjaga koleksi & konsistensi kualitas.",
  "products.bannerAlt": "Produk Noblekase",
  "products.showingCount": "Menampilkan {shown} dari {total} produk",
  "products.noMatchFilter": "Tidak ada produk yang cocok dengan filter ini.",
  "category.notFoundTitle": "Kategori tidak ditemukan",
  "category.eyebrow": "Kategori",
  "category.showingCount": "Menampilkan {shown} dari {total} produk di {category}",

  // Detail produk
  "product.notFoundTitle": "Produk tidak ditemukan",
  "product.galleryViewAlt": "{name} tampak {index}",
  "product.marketplaceHeading": "Beli di marketplace pilihan",
  "product.badge.bestPrice": "Harga terbaik",
  "product.badge.fastShip": "Pengiriman cepat",
  "product.badge.newRelease": "Baru rilis",
  "product.askWhatsApp": "Tanya via WhatsApp →",
  "product.whatsAppPrefill": "Halo Noblekase, saya tertarik dengan produk ",
  "product.storyHeading": "Cerita Produk",
  "product.specsHeading": "Spesifikasi",
  "product.lifestyleEyebrow": "Dalam Keseharian",
  "product.lifestyleHeadingTemplate": "{name} di hari-hari biasa",
  "product.lifestyleAlt": "Keseharian {index}",
  "product.relatedEyebrow": "Mungkin juga cocok",
  "product.relatedHeading": "Produk lain yang sering dipasangkan",
  "product.buyCta": "Beli {name}",

  // Tentang
  "about.metaTitle": "Tentang Noblekase",
  "about.metaDescription":
    "Cerita di balik Noblekase: aksesoris yang menemani hari-hari setiap orang dengan kualitas konsisten dan desain editorial.",

  // Beranda — bagian
  "hero.eyebrow": "Edisi Berjalan",
  "hero.headline": "Aksesoris yang menemani hari-hari setiap orang.",
  "hero.subheadline": "Kualitas konsisten. Desain yang tidak biasa. Tersedia untuk semua.",
  "hero.imageAlt": "Noblekase",
  "hero.cta": "Jelajahi produk",
  "hero.imagePlaceholder": "Gambar hero",
  "carousel.ariaLabel": "Sorotan Noblekase",
  "carousel.slideOfTemplate": "{index} dari {total}",
  "carousel.prev": "Slide sebelumnya",
  "carousel.next": "Slide berikutnya",
  "carousel.goToSlide": "Ke slide {index}",
  "categoryGrid.eyebrow": "Pilih Kategori",
  "categoryGrid.headline": "Mulai dari yang Anda butuhkan",
  "featured.eyebrow": "Cerita Edisi Ini",
  "featured.headline": "Untuk Pekerja Mobile",
  "featured.subheadline": "Koleksi pilihan untuk teman bekerja di mana saja",
  "featured.imagePlaceholder": "Produk unggulan",
  "brandSnippet.eyebrow": "Tentang Noblekase",
  "brandSnippet.headline": "Bukan sekadar aksesoris",
  "brandSnippet.body":
    "Kami percaya bahwa setiap orang berhak atas aksesoris yang berkualitas dan terdesain baik—tanpa harus mengeluarkan biaya berlebihan.",
  "brandSnippet.cta": "Selengkapnya",
  "brandSnippet.imageAlt": "Noblekase",
  "brandSnippet.imagePlaceholder": "Gambar brand",
  "marketplaceCta.eyebrow": "Dapatkan Di",
  "marketplaceCta.headline": "Beli langsung di marketplace pilihan",
  "productTabs.eyebrow": "Koleksi",
  "productTabs.headline": "Pilihan untuk hari-hari Anda",
  "productTabs.tab.new": "Terbaru",
  "productTabs.tab.best": "Terlaris",
  "productTabs.tab.all": "Semua",
  "promo.eyebrow": "Edisi Berjalan",
  "promo.headline": "Perlengkapan harian, satu paket",
  "promo.cta": "Jelajahi koleksi",

  // Filter & urutan
  "filter.marketplaceNote":
    "Harga ditampilkan di setiap marketplace. Kami menyatukan koleksi — marketplace yang memutuskan promo & ongkos kirim.",
  "filter.categoryHeading": "Kategori",
  "filter.allProducts": "Semua produk",
  "filter.typeHeading": "Tipe",
  "filter.allTypes": "Semua tipe",
  "filter.labelHeading": "Label",
  "filter.reset": "Reset filter",
  "sort.label": "Urutkan",
  "sort.ariaLabel": "Urutkan produk",
  "sort.option.default": "Urutan pilihan",
  "sort.option.newest": "Terbaru",
  "sort.option.nameAsc": "Nama A–Z",
  "badge.new": "Baru",
  "badge.best": "Terlaris",
  "badge.pro": "Pro",

  // Chatbot
  "chatbot.title": "AI Assistant Noblekase",
  "chatbot.status": "Online · 24/7",
  "chatbot.placeholder": "Ketik pertanyaan...",
  "chatbot.greeting": "Halo! Ada yang bisa saya bantu seputar produk Noblekase?",
  "chatbot.connectionError": "Maaf, koneksi bermasalah. Coba lagi sebentar lagi.",
  "chatbot.inputAriaLabel": "Pesan untuk asisten",
  "chatbot.send": "Kirim",
  "chatbot.openChat": "Buka chat dengan asisten",
  "chatbot.closeChat": "Tutup chat",
} as const;

export type TranslationKey = keyof typeof id;

/**
 * Kamus Inggris. Tipe `Record<TranslationKey, string>` membuat TypeScript
 * gagal build kalau ada kunci yang lupa diterjemahkan — jauh lebih aman
 * daripada baru ketahuan sebagai teks Indonesia nyasar di halaman EN.
 */
const en: Record<TranslationKey, string> = {
  "common.home": "Home",
  "common.products": "Products",
  "common.categories": "Categories",
  "common.journal": "Journal",
  "common.close": "Close",
  "common.viewAll": "View all →",
  "common.viewAllProducts": "View all products",
  "common.minutesShort": "min",
  "common.imagePlaceholder": "image",
  "common.productsSuffix": "products",

  "nav.home": "Home",
  "nav.products": "Products",
  "nav.about": "About",
  "nav.journal": "Journal",
  "nav.support": "Support",
  "nav.more": "More",
  "nav.openMenu": "Open menu",
  "nav.search": "Search",
  "nav.switchLanguage": "Switch language",

  "footer.columnSocial": "Social",
  "footer.category.chargerPower": "Charger & Power",
  "footer.category.cableConnector": "Cables & Connectors",
  "footer.category.holderStand": "Holders & Stands",
  "footer.category.audioCase": "Audio & Cases",

  "site.taglineFallback": "Accessories that keep up with everyday life",
  "site.metaDescriptionFallback":
    "A phone accessories brand built on consistent quality and editorial design, made for everyone.",

  "error.eyebrow": "Something went wrong",
  "error.heading": "Sorry, this page failed to load",
  "error.body":
    "A temporary problem on our side. Try reloading — if it persists, reach us through the Support page.",
  "error.retry": "Try again",
  "error.contactSupport": "Contact Support",
  "error.referenceCode": "Reference code:",
  "notFound.metaTitle": "Page not found",
  "notFound.heading": "This page doesn’t exist",
  "notFound.body":
    "The link may have changed, or there’s a typo. Try a search, or start from our collection.",
  "notFound.searchPlaceholder": "Search products or articles…",
  "notFound.backHome": "Back to home",

  "search.metaTitle": "Search",
  "search.metaTitleWithQuery": "Search: {query}",
  "search.metaDescription": "Search Noblekase products, articles, and categories.",
  "search.eyebrow": "Search",
  "search.resultsFor": "Results for “{query}”",
  "search.headingEmpty": "Search products & stories",
  "search.countFound": "{count} results found",
  "search.noMatch": "No matching results",
  "search.minChars": "Type at least 2 characters to start searching.",
  "search.hintExamples": "Try words like charger, cable, earbuds, or case.",
  "search.emptyHeading": "Nothing matched yet",
  "search.emptyBody": "Try a different keyword, or browse our full collection.",
  "search.productCount": "{count} products",
  "search.articleCount": "{count} articles",
  "search.placeholder": "Search products, categories, or articles…",
  "search.inputAriaLabel": "Search keyword",
  "search.submit": "Search",
  "search.dialogAriaLabel": "Search",
  "search.closeOverlay": "Close search",
  "search.overlayMinChars": "Type at least 2 characters…",
  "search.loading": "Searching…",
  "search.overlayNoResults": "No results.",
  "search.viewAllResults": "See all results for “{query}” →",

  "support.metaTitle": "Support",
  "support.metaDescription":
    "Reach the Noblekase team via WhatsApp, Instagram, or email. Check the FAQ for common questions.",
  "support.eyebrow": "Support",
  "support.heading": "Let us help you",
  "support.intro":
    "A small team that reads every message. WhatsApp is fastest during business hours, or DM us on Instagram anytime.",
  "support.heroImageAlt": "Contact Noblekase",
  "support.channelsEyebrow": "Channels",
  "support.channelsHeading": "Pick whichever is easiest for you",
  "support.faqEyebrow": "FAQ",
  "support.faqHeading": "Frequently asked questions",

  "journal.metaTitle": "Journal",
  "journal.metaDescription":
    "Stories, guides, and inspiration from Noblekase — on phone accessories and everyday life.",
  "journal.countTemplate": "{count} stories",
  "journal.eyebrow": "Journal",
  "journal.heading": "Stories & guides from Noblekase",
  "journal.intro":
    "Unpacked slowly: how to pick the right charger, why we chose FSC paper, and the story behind every edition.",
  "journal.highlightLabel": "Highlight",
  "journal.readMore": "Read more →",
  "journal.allArticlesEyebrow": "All Articles",
  "journalTeaser.eyebrow": "From the Journal",
  "journalTeaser.headline": "Latest stories & guides",

  "article.notFoundTitle": "Article not found",
  "article.relatedHeadingTemplate": "More stories from {category}",
  "article.readingTimeUnit": "min read",
  "article.backToJournal": "← Back to Journal",
  "article.shareLabel": "Share:",
  "article.relatedEyebrow": "Related articles",

  "products.metaTitle": "Products",
  "products.metaDescription":
    "Explore the Noblekase collection: GaN chargers, cables, holders, audio, and cases.",
  "products.eyebrow": "Collection",
  "products.heading": "All Noblekase products",
  "products.intro":
    "Four categories for your everyday. Pricing lives on your preferred marketplace — we look after the collection and quality consistency.",
  "products.bannerAlt": "Noblekase products",
  "products.showingCount": "Showing {shown} of {total} products",
  "products.noMatchFilter": "No products match this filter.",
  "category.notFoundTitle": "Category not found",
  "category.eyebrow": "Category",
  "category.showingCount": "Showing {shown} of {total} products in {category}",

  "product.notFoundTitle": "Product not found",
  "product.galleryViewAlt": "{name} view {index}",
  "product.marketplaceHeading": "Buy on your preferred marketplace",
  "product.badge.bestPrice": "Best price",
  "product.badge.fastShip": "Fast shipping",
  "product.badge.newRelease": "Just released",
  "product.askWhatsApp": "Ask via WhatsApp →",
  "product.whatsAppPrefill": "Hi Noblekase, I'm interested in ",
  "product.storyHeading": "Product Story",
  "product.specsHeading": "Specifications",
  "product.lifestyleEyebrow": "In Everyday Use",
  "product.lifestyleHeadingTemplate": "{name} on an ordinary day",
  "product.lifestyleAlt": "Lifestyle {index}",
  "product.relatedEyebrow": "You might also like",
  "product.relatedHeading": "Products often paired together",
  "product.buyCta": "Buy {name}",

  "about.metaTitle": "About Noblekase",
  "about.metaDescription":
    "The story behind Noblekase: accessories that keep up with everyday life, built on consistent quality and editorial design.",

  "hero.eyebrow": "Current Edition",
  "hero.headline": "Accessories that keep up with everyday life.",
  "hero.subheadline": "Consistent quality. Design that stands out. Available to everyone.",
  "hero.imageAlt": "Noblekase",
  "hero.cta": "Explore products",
  "hero.imagePlaceholder": "Hero image",
  "carousel.ariaLabel": "Noblekase highlights",
  "carousel.slideOfTemplate": "{index} of {total}",
  "carousel.prev": "Previous slide",
  "carousel.next": "Next slide",
  "carousel.goToSlide": "Go to slide {index}",
  "categoryGrid.eyebrow": "Pick a Category",
  "categoryGrid.headline": "Start with what you need",
  "featured.eyebrow": "This Edition’s Story",
  "featured.headline": "For Mobile Workers",
  "featured.subheadline": "A curated set for working from anywhere",
  "featured.imagePlaceholder": "Featured product",
  "brandSnippet.eyebrow": "About Noblekase",
  "brandSnippet.headline": "More than an accessory",
  "brandSnippet.body":
    "We believe everyone deserves well-made, well-designed accessories — without paying a premium for it.",
  "brandSnippet.cta": "Read more",
  "brandSnippet.imageAlt": "Noblekase",
  "brandSnippet.imagePlaceholder": "Brand image",
  "marketplaceCta.eyebrow": "Available At",
  "marketplaceCta.headline": "Buy directly on your preferred marketplace",
  "productTabs.eyebrow": "Collection",
  "productTabs.headline": "Picks for your everyday",
  "productTabs.tab.new": "Newest",
  "productTabs.tab.best": "Best sellers",
  "productTabs.tab.all": "All",
  "promo.eyebrow": "Current Edition",
  "promo.headline": "Daily essentials, in one set",
  "promo.cta": "Explore the collection",

  "filter.marketplaceNote":
    "Prices are shown on each marketplace. We curate the collection — the marketplace decides promos and shipping.",
  "filter.categoryHeading": "Category",
  "filter.allProducts": "All products",
  "filter.typeHeading": "Type",
  "filter.allTypes": "All types",
  "filter.labelHeading": "Label",
  "filter.reset": "Reset filters",
  "sort.label": "Sort",
  "sort.ariaLabel": "Sort products",
  "sort.option.default": "Curated order",
  "sort.option.newest": "Newest",
  "sort.option.nameAsc": "Name A–Z",
  "badge.new": "New",
  "badge.best": "Best seller",
  "badge.pro": "Pro",

  "chatbot.title": "Noblekase AI Assistant",
  "chatbot.status": "Online · 24/7",
  "chatbot.placeholder": "Type your question...",
  "chatbot.greeting": "Hi! How can I help you with Noblekase products?",
  "chatbot.connectionError": "Sorry, the connection dropped. Please try again shortly.",
  "chatbot.inputAriaLabel": "Message to assistant",
  "chatbot.send": "Send",
  "chatbot.openChat": "Open chat with assistant",
  "chatbot.closeChat": "Close chat",
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { id, en };

/**
 * Ambil satu string terjemahan.
 * Placeholder ditulis {seperti ini} dan diisi lewat argumen `vars`.
 *
 *   t("en", "search.countFound", { count: 12 }) → "12 results found"
 */
export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template = dictionaries[locale]?.[key] ?? dictionaries[defaultLocale][key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * Versi terikat locale — dipakai komponen agar tidak perlu mengoper
 * `locale` di setiap pemanggilan: `const tr = translator(locale)`.
 */
export function translator(locale: Locale) {
  return (key: TranslationKey, vars?: Record<string, string | number>) => t(locale, key, vars);
}

export type Translator = ReturnType<typeof translator>;
