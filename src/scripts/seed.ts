/**
 * seed.ts — Isi database Payload dari konten showcase (sample-data.ts)
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Jalankan:  pnpm seed
 * (script package.json: `payload run src/scripts/seed.ts`)
 *
 * Idempotent guard: jika sudah ada produk, script berhenti kecuali
 * environment variable FORCE_SEED=true di-set.
 *
 * Prasyarat: database sudah termigrasi (`pnpm migrate`) dan file gambar
 * ada di ./public/images/... (dipakai untuk upload ke koleksi Media).
 */

import fs from "fs";
import path from "path";

// ------------------------------------------------------------------
// Load env (.env.local diprioritaskan, lalu .env) sebelum import config
// ------------------------------------------------------------------
function loadEnv(file: string) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");
const {
  heroEdition,
  categories,
  allMarketplaces,
  products,
  featuredCollection,
  articles,
} = await import("@/lib/sample-data");

// ------------------------------------------------------------------
// Lexical richText helpers (minimal, cukup untuk seed)
// ------------------------------------------------------------------
type Block = { type: "p" | "h2" | "quote" | "img"; text?: string; src?: string };

function textNode(text: string) {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}
function paragraph(text: string) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, textFormat: 0, type: "paragraph", version: 1 };
}
function heading(text: string) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "heading", tag: "h2", version: 1 };
}
function quote(text: string) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "quote", version: 1 };
}
function richTextFromString(text: string) {
  return { root: { children: [paragraph(text)], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
}
function richTextFromBlocks(blocks: Block[]) {
  const children = blocks
    .filter((b) => b.type !== "img" && b.text) // gambar inline dilewati di seed
    .map((b) => (b.type === "h2" ? heading(b.text!) : b.type === "quote" ? quote(b.text!) : paragraph(b.text!)));
  if (children.length === 0) children.push(paragraph(""));
  return { root: { children, direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
}

// ------------------------------------------------------------------
// Mapping data tambahan
// ------------------------------------------------------------------
const badgeMap: Record<string, string> = { NEW: "new", BEST: "best-seller", PRO: "limited" };

const subCategoryDefs = [
  { slug: "wall-charger", name: "Wall Charger", category: "charger-power" },
  { slug: "power-bank", name: "Power Bank", category: "charger-power" },
  { slug: "kabel-usbc", name: "Kabel USB-C", category: "kabel-konektor" },
  { slug: "kabel-lightning", name: "Kabel Lightning", category: "kabel-konektor" },
  { slug: "adapter-hub", name: "Adapter & Hub", category: "kabel-konektor" },
  { slug: "desk-stand", name: "Desk Stand", category: "holder-stand" },
  { slug: "car-mount", name: "Car Mount", category: "holder-stand" },
  { slug: "tripod", name: "Tripod", category: "holder-stand" },
  { slug: "audio", name: "Audio", category: "audio-casing" },
  { slug: "casing", name: "Casing", category: "audio-casing" },
];

const productSubCategory: Record<string, string> = {
  "pulse-30w": "wall-charger",
  "pulse-65w": "wall-charger",
  "bank-10k": "power-bank",
  "bank-20k": "power-bank",
  "kabel-usbc-1m": "kabel-usbc",
  "kabel-usbc-2m": "kabel-usbc",
  "kabel-lightning": "kabel-lightning",
  "hub-usbc-7in1": "adapter-hub",
  "desk-stand": "desk-stand",
  "car-mount": "car-mount",
  "magsafe-mount": "desk-stand",
  "tripod-mini": "tripod",
  "earbuds-pro": "audio",
  "speaker-mini": "audio",
  "casing-clear": "casing",
  "casing-leather": "casing",
};

const benefitFromBadge: Record<string, string> = {
  "best-price": "Harga Terbaik",
  "fast-ship": "Pengiriman Cepat",
  new: "Baru",
};

const mpColor: Record<string, string> = {
  tokopedia: "#00AA5B",
  shopee: "#EE4D2D",
  tiktok: "#000000",
  lazada: "#0F146D",
};

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
const seed = async () => {
  const payload = await getPayload({ config });

  const existing = await payload.count({ collection: "products" });
  if (existing.totalDocs > 0 && process.env.FORCE_SEED !== "true") {
    payload.logger.warn(
      `Sudah ada ${existing.totalDocs} produk. Seed dibatalkan. Set FORCE_SEED=true untuk menimpa.`,
    );
    process.exit(0);
  }

  // --- Media upload dengan cache (path -> id) ---
  const mediaCache = new Map<string, number | string>();
  async function upload(imageUrl: string | undefined, alt: string): Promise<number | string | undefined> {
    if (!imageUrl) return undefined;
    if (mediaCache.has(imageUrl)) return mediaCache.get(imageUrl);
    const filePath = path.resolve(process.cwd(), "public", imageUrl.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      payload.logger.warn(`Gambar tidak ditemukan, dilewati: ${imageUrl}`);
      return undefined;
    }
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      filePath,
    });
    mediaCache.set(imageUrl, doc.id);
    return doc.id;
  }

  // --- Marketplaces ---
  payload.logger.info("Seeding marketplaces...");
  const mpBySlug = new Map<string, number | string>();
  let mpOrder = 0;
  for (const mp of allMarketplaces) {
    const doc = await payload.create({
      collection: "marketplaces",
      data: {
        name: mp.name,
        slug: mp.key,
        baseUrl: mp.url,
        color: mpColor[mp.key] || undefined,
        order: mpOrder++,
        status: "published",
      },
    });
    mpBySlug.set(mp.key, doc.id);
  }

  // --- Categories ---
  payload.logger.info("Seeding categories...");
  const catBySlug = new Map<string, number | string>();
  let catOrder = 0;
  for (const cat of categories) {
    const imageId = await upload(cat.imageUrl, `Kategori ${cat.name}`);
    const doc = await payload.create({
      collection: "categories",
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: imageId,
        order: catOrder++,
        status: "published",
      },
    });
    catBySlug.set(cat.slug, doc.id);
  }

  // --- SubCategories ---
  payload.logger.info("Seeding sub-categories...");
  const subBySlug = new Map<string, number | string>();
  let subOrder = 0;
  for (const sub of subCategoryDefs) {
    const doc = await payload.create({
      collection: "sub-categories",
      data: {
        name: sub.name,
        slug: sub.slug,
        category: catBySlug.get(sub.category),
        order: subOrder++,
        status: "published",
      },
    });
    subBySlug.set(sub.slug, doc.id);
  }

  // --- Products ---
  payload.logger.info("Seeding products...");
  const prodBySlug = new Map<string, number | string>();
  let prodOrder = 0;
  for (const p of products) {
    const mainImage = await upload(p.imageUrl, p.name);
    if (!mainImage) {
      payload.logger.warn(`Produk ${p.slug} tidak punya mainImage valid — dilewati.`);
      continue;
    }
    // gallery + lifestyle
    const gallery: { image: number | string; type: string }[] = [];
    for (const g of p.gallery || []) {
      const id = await upload(g, `${p.name} — foto`);
      if (id) gallery.push({ image: id, type: "gallery" });
    }
    for (const l of p.lifestyle || []) {
      const id = await upload(l, `${p.name} — lifestyle`);
      if (id) gallery.push({ image: id, type: "lifestyle" });
    }
    // marketplace links
    const marketplaceLinks = (p.marketplaces || []).map((mp) => ({
      marketplace: mpBySlug.get(mp.key),
      url: mp.url,
      benefitLabel: mp.badge ? benefitFromBadge[mp.badge] : undefined,
      isPrimary: mp.badge === "best-price",
    }));

    const doc = await payload.create({
      collection: "products",
      data: {
        name: p.name,
        slug: p.slug,
        subCategory: subBySlug.get(productSubCategory[p.slug]),
        tagline: p.tagline,
        badge: p.badge ? badgeMap[p.badge] : undefined,
        storyHeadline: p.tagline,
        storyBody: richTextFromString(p.story),
        mainImage,
        gallery,
        specs: (p.specs || []).map((s) => ({ label: s.label, value: s.value })),
        marketplaceLinks,
        order: prodOrder++,
        status: "published",
      },
    });
    prodBySlug.set(p.slug, doc.id);
  }

  // --- Article Categories (dari nama kategori unik di articles) ---
  payload.logger.info("Seeding article categories...");
  const artCatBySlug = new Map<string, number | string>();
  const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  let artCatOrder = 0;
  for (const name of Array.from(new Set(articles.map((a) => a.category)))) {
    const doc = await payload.create({
      collection: "article-categories",
      data: { name, slug: slugify(name), order: artCatOrder++ },
    });
    artCatBySlug.set(slugify(name), doc.id);
  }

  // --- Articles ---
  payload.logger.info("Seeding articles...");
  for (const a of articles) {
    const heroImage = await upload(a.heroUrl || a.coverUrl, a.title);
    if (!heroImage) {
      payload.logger.warn(`Artikel ${a.slug} tidak punya heroImage valid — dilewati.`);
      continue;
    }
    await payload.create({
      collection: "articles",
      data: {
        title: a.title,
        slug: a.slug,
        category: artCatBySlug.get(slugify(a.category)),
        intro: a.excerpt,
        heroImage,
        body: richTextFromBlocks(a.body as Block[]),
        readingTime: a.readingTime,
        status: "published",
        publishedAt: new Date(a.publishedAt).toISOString(),
      },
    });
  }

  // --- Hero Edition ---
  payload.logger.info("Seeding hero edition...");
  const heroImg = await upload(heroEdition.imageUrlDesktop, heroEdition.headline);
  if (heroImg) {
    await payload.create({
      collection: "hero-editions",
      data: {
        label: "Edisi Mei 2026",
        eyebrow: heroEdition.eyebrow,
        headline: heroEdition.headline,
        subheadline: heroEdition.subheadline,
        image: heroImg,
        ctaLabel: heroEdition.ctaLabel,
        ctaUrl: heroEdition.ctaUrl,
        isActive: true,
      },
    });
  }

  // --- Featured Collection ---
  payload.logger.info("Seeding featured collection...");
  const mainProduct = prodBySlug.get(featuredCollection.mainProductSlug);
  if (mainProduct) {
    await payload.create({
      collection: "featured-collections",
      data: {
        eyebrow: featuredCollection.eyebrow,
        headline: featuredCollection.headline,
        subheadline: featuredCollection.subheadline,
        mainProduct,
        secondaryProducts: featuredCollection.secondaryProductSlugs
          .map((s) => prodBySlug.get(s))
          .filter(Boolean) as (number | string)[],
        isActive: true,
      },
    });
  }

  payload.logger.info("✅ Seed selesai.");
  process.exit(0);
};

try {
  await seed();
} catch (err) {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
}
