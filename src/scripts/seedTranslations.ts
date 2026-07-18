/**
 * seedTranslations.ts — isi locale Inggris (en) untuk seluruh konten yang
 * sudah di-seed dalam Bahasa Indonesia.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Jalankan:  pnpm seed:translations   (aman diulang — idempotent)
 *
 * ------------------------------------------------------------------
 * KENAPA HANYA FIELD `localized: true` YANG DITULIS
 * ------------------------------------------------------------------
 * Di Payload, `locale` pada update HANYA berlaku untuk field yang ditandai
 * `localized: true`. Field non-lokal (slug, url, order, status, relasi,
 * ID media, warna, ikon, checkbox) disimpan SATU KALI dan dipakai bersama
 * oleh semua locale. Jadi kalau field non-lokal ikut dikirim di sini,
 * nilainya akan menimpa versi Bahasa Indonesia juga — bukan membuat versi
 * Inggris yang terpisah. Karena itu setiap payload di bawah sudah dicek
 * satu per satu terhadap definisi koleksi/global-nya, dan hanya field
 * lokal yang dikirim.
 *
 * Pengecualian yang disengaja: BARIS ARRAY (specs, navItems, channels,
 * blocks halaman, ...). Payload mengganti isi array secara utuh, jadi baris
 * harus dikirim lengkap beserta `id`-nya. Kalau field non-lokal di dalam
 * baris (url, icon, image) tidak ikut dikirim, nilainya akan hilang. Solusi
 * di sini: baca dokumen pada locale "id", lalu kirim ulang baris tersebut
 * APA ADANYA dan hanya menimpa sub-field yang lokal. Tidak ada nilai
 * non-lokal yang berubah.
 *
 * Pencocokan dokumen memakai kunci stabil (slug / label / url / ikon),
 * bukan ID numerik — ID berbeda antar environment. Dokumen yang tidak
 * ditemukan dilewati dengan peringatan, script tidak berhenti.
 */

import fs from "fs";
import path from "path";

import type { CollectionSlug, GlobalSlug, Where } from "payload";
import type { Page, Product } from "@/payload-types";

// ------------------------------------------------------------------
// Load env (.env.local diprioritaskan, lalu .env) sebelum import config
// ------------------------------------------------------------------
function loadEnv(file: string) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");

// ------------------------------------------------------------------
// Lexical richText helpers — bentuknya SAMA PERSIS dengan seed.ts /
// seedContent.ts supaya konten ID & EN punya struktur node identik.
// ------------------------------------------------------------------
type RichText = NonNullable<Product["storyBody"]>;
type BodyBlock = { type: "p" | "h2" | "quote"; text: string };

function textNode(text: string) {
  return {
    detail: 0,
    format: 0,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}
function paragraph(text: string) {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
    type: "paragraph",
    version: 1,
  };
}
function heading(text: string) {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "heading",
    tag: "h2",
    version: 1,
  };
}
function quote(text: string) {
  return {
    children: [textNode(text)],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "quote",
    version: 1,
  };
}
function rt(text: string): RichText {
  return {
    root: {
      children: [paragraph(text)],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}
function rtBlocks(blocks: BodyBlock[]): RichText {
  const children = blocks.map((b) =>
    b.type === "h2"
      ? heading(b.text)
      : b.type === "quote"
        ? quote(b.text)
        : paragraph(b.text),
  );
  if (children.length === 0) children.push(paragraph(""));
  return {
    root: {
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

// ==================================================================
// TABEL TERJEMAHAN
// Nada bahasa mengikuti kamus UI di src/lib/i18n.ts: editorial, ringkas,
// tidak berlebihan. Nama brand & istilah teknis tidak diterjemahkan.
// ==================================================================

// --- Categories (kunci: slug) — field lokal: name, description ---
const categoryEN: Record<string, { name: string; description: string }> = {
  "charger-power": {
    name: "Charger & Power",
    description:
      "Fast GaN chargers, compact power banks, and everyday adapters built to last.",
  },
  "kabel-konektor": {
    name: "Cables & Connectors",
    description:
      "Braided cables, multi-port connectors, and practical hubs for a mobile setup.",
  },
  "holder-stand": {
    name: "Holders & Stands",
    description:
      "Desk holders, car mounts, and steady tripods that keep you productive.",
  },
  "audio-casing": {
    name: "Audio & Cases",
    description: "Earbuds, speakers, and cases finished with real care.",
  },
};

// --- Sub-categories (kunci: slug) — field lokal: name (description belum di-seed) ---
const subCategoryEN: Record<string, string> = {
  "wall-charger": "Wall Charger",
  "power-bank": "Power Bank",
  "kabel-usbc": "USB-C Cable",
  "kabel-lightning": "Lightning Cable",
  "adapter-hub": "Adapters & Hubs",
  "desk-stand": "Desk Stand",
  "car-mount": "Car Mount",
  tripod: "Tripod",
  audio: "Audio",
  casing: "Case",
};

/**
 * Products (kunci: slug) — field lokal yang di-seed: name, tagline,
 * storyEyebrow, storyHeadline, storyBody, specs[].label/value.
 * `specs` diurutkan sama persis dengan seed.ts (dicocokkan per indeks).
 */
type ProductEN = {
  name: string;
  tagline: string;
  story: string;
  specs: { label: string; value: string }[];
};

const PRODUCT_STORY_EYEBROW_EN = "PRODUCT STORY";

const productEN: Record<string, ProductEN> = {
  "pulse-30w": {
    name: "Pulse 30W GaN Charger",
    tagline: "Fast, compact, one plug for everything",
    story:
      "The Pulse 30W is built to quietly become part of your day. Heat-resistant PC with a matte finish that sits well in the hand, small enough for a trouser pocket, yet powerful enough for a light laptop, a tablet, or the latest phone.",
    specs: [
      { label: "Power Output", value: "30W (USB-C PD 3.0)" },
      { label: "Ports", value: "1× USB-C" },
      { label: "Technology", value: "GaN II" },
      { label: "Input", value: "100-240V AC, 50/60 Hz" },
      { label: "Weight", value: "62 g" },
      { label: "Dimensions", value: "44 × 38 × 30 mm" },
      { label: "Certification", value: "PSE, CE, FCC" },
    ],
  },
  "pulse-65w": {
    name: "Pulse 65W Dual USB-C",
    tagline: "Two devices, one adapter",
    story:
      "For anyone who carries a laptop and a phone everywhere, the Pulse 65W charges both at once without slowing either one down.",
    specs: [
      { label: "Power Output", value: "65W total (PD 3.0)" },
      { label: "Ports", value: "2× USB-C" },
      { label: "Technology", value: "GaN II" },
      { label: "Weight", value: "118 g" },
    ],
  },
  "bank-10k": {
    name: "10,000 mAh Power Bank",
    tagline: "Palm-sized, enough for a full day",
    story:
      "Compact enough for a work bag or a jacket pocket, with two USB-C ports so you can charge two devices at the same time.",
    specs: [
      { label: "Capacity", value: "10,000 mAh" },
      { label: "Output", value: "USB-C PD 22.5W, USB-A QC 18W" },
      { label: "Weight", value: "198 g" },
    ],
  },
  "bank-20k": {
    name: "20,000 mAh Power Bank",
    tagline: "For long trips and on-call days",
    story:
      "Plenty of capacity for multi-day travel, still light thanks to high-density battery cells.",
    specs: [
      { label: "Capacity", value: "20,000 mAh" },
      { label: "Output", value: "USB-C PD 45W, USB-A QC 18W" },
      { label: "Weight", value: "388 g" },
    ],
  },
  "kabel-usbc-1m": {
    name: "USB-C Cable 100W 1m",
    tagline: "Nylon braid, aluminium housing",
    story:
      "Built to survive more than 30,000 bends, with a braided nylon jacket that resists tangling.",
    specs: [
      { label: "Length", value: "1 meter" },
      { label: "Max Power", value: "100W (5A)" },
      { label: "Data Transfer", value: "USB 2.0, 480 Mbps" },
    ],
  },
  "kabel-usbc-2m": {
    name: "USB-C Cable 100W 2m",
    tagline: "More room for a desk setup",
    story:
      "The right length for charging your phone from a power bank in your bag, or running a portable monitor.",
    specs: [
      { label: "Length", value: "2 meters" },
      { label: "Max Power", value: "100W (5A)" },
    ],
  },
  "kabel-lightning": {
    name: "Lightning Cable MFi 1m",
    tagline: "MFi certified, safe for iPhone",
    story:
      "MFi (Made for iPhone) certified, so a compatibility warning never shows up.",
    specs: [
      { label: "Length", value: "1 meter" },
      { label: "Certification", value: "MFi by Apple" },
    ],
  },
  "hub-usbc-7in1": {
    name: "USB-C Hub 7-in-1",
    tagline: "4K HDMI, two USB, SD/microSD, PD",
    story:
      "An all-in-one answer for laptops and tablets short on ports, with HDMI output at 4K @ 60Hz.",
    specs: [
      { label: "Ports", value: "HDMI 4K, 2× USB-A, USB-C PD, SD, microSD" },
      { label: "Material", value: "Brushed aluminium" },
    ],
  },
  "desk-stand": {
    name: "Aluminium Desk Stand",
    tagline: "The right angle for calls and reading",
    story:
      "A minimal design in brushed aluminium, with an angle you can set anywhere between 15° and 60°.",
    specs: [
      { label: "Material", value: "6061 aluminium" },
      { label: "Compatibility", value: "Phones & tablets up to 12.9 inches" },
    ],
  },
  "car-mount": {
    name: "Magnetic Car Mount",
    tagline: "A secure grip on the air vent",
    story:
      "Strong N52 magnets for MagSafe cases, on a silicone-lined vent clip that will not chew up your vents.",
    specs: [
      { label: "Type", value: "Magnetic, MagSafe-compatible" },
      { label: "Mounting", value: "Vent clip" },
    ],
  },
  "magsafe-mount": {
    name: "MagSafe Desk Mount",
    tagline: "Charging while it stands on your desk",
    story:
      "A magnetic stand for iPhone with 15W USB-C input, in portrait or landscape.",
    specs: [
      { label: "Power", value: "MagSafe 15W (PD input)" },
      { label: "Compatibility", value: "iPhone 12 and later" },
    ],
  },
  "tripod-mini": {
    name: "Foldable Mini Tripod",
    tagline: "Compact and steady for solo creators",
    story:
      "A foldable tripod with a ball head for phones and light cameras, on non-slip feet.",
    specs: [
      { label: "Height", value: "12–24 cm" },
      { label: "Max Load", value: "1.5 kg" },
    ],
  },
  "earbuds-pro": {
    name: "Earbuds Pro ANC",
    tagline: "Noise cancelling for the commute",
    story:
      "11 mm dynamic drivers, ANC down to -38 dB, and 8 hours of playback (32 with the case). LDAC and AAC codecs.",
    specs: [
      { label: "Driver", value: "11 mm dynamic" },
      { label: "ANC", value: "Up to -38 dB" },
      { label: "Battery", value: "8 hours (32 hours with case)" },
      { label: "Codecs", value: "LDAC, AAC, SBC" },
    ],
  },
  "speaker-mini": {
    name: "Mini Bluetooth Speaker",
    tagline: "For work sessions and small picnics",
    story:
      "IP67 rated, 10W of output, and 16 hours of battery, with a carabiner strap to clip onto a bag.",
    specs: [
      { label: "Output", value: "10W RMS" },
      { label: "Battery", value: "16 hours" },
      { label: "Rating", value: "IP67 (waterproof)" },
    ],
  },
  "casing-clear": {
    name: "Clear Hybrid Case",
    tagline: "Stays clear, keeps the original color",
    story:
      "TPU and PC with a UV coating so it will not yellow. Drop tested to 2 meters.",
    specs: [
      { label: "Material", value: "TPU + PC with UV coating" },
      { label: "Drop Protection", value: "2 meters (MIL-STD-810G)" },
    ],
  },
  "casing-leather": {
    name: "Leather Magnetic Case",
    tagline: "Genuine leather, premium finish",
    story:
      "Genuine top-grain leather with a magnet ring for MagSafe accessories.",
    specs: [
      { label: "Material", value: "Top-grain leather" },
      { label: "Magnet", value: "MagSafe-compatible" },
    ],
  },
};

// --- Article categories (kunci: slug) — field lokal: name ---
const articleCategoryEN: Record<string, string> = {
  panduan: "Guides",
  tips: "Tips",
  inspirasi: "Inspiration",
  edukasi: "Explainers",
  cerita: "Stories",
};

// --- Articles (kunci: slug) — field lokal: title, intro, body ---
const articleEN: Record<
  string,
  { title: string; intro: string; body: BodyBlock[] }
> = {
  "memilih-charger-gan": {
    title: "Choosing a GaN charger for travel",
    intro:
      "A short guide to picking a charger that stays small but still powers everything you carry.",
    body: [
      {
        type: "p",
        text: "What you pack changes from trip to trip. If it is a laptop, a phone, and earbuds, the total power you need can reach 65W.",
      },
      { type: "h2", text: "Why GaN?" },
      {
        type: "p",
        text: "Gallium Nitride (GaN) lets an adapter be 40-50% smaller than conventional silicon, while handling heat better.",
      },
      {
        type: "p",
        text: "For everyday travel, 30-45W is plenty. If you often work from cafes and co-working spaces, a 65W dual-port is more flexible.",
      },
      {
        type: "quote",
        text: "Carry the adapter your day actually needs — not the biggest one.",
      },
      {
        type: "p",
        text: "Think about cable length too: in hotels and cafes, a 1.5-2 meter cable gives you far more room to work with.",
      },
    ],
  },
  "merawat-kabel-anti-rusak": {
    title: "Cable care: the small habits that help",
    intro: "Simple ways to make your braided and Lightning cables last longer.",
    body: [
      {
        type: "p",
        text: "Cables usually fail not because of poor quality, but from repeated bending right at the connector.",
      },
      { type: "h2", text: "Rules of thumb" },
      {
        type: "p",
        text: "Pull from the connector head, never the cable itself. Fold it loosely in your bag instead of winding it tight.",
      },
    ],
  },
  "setup-meja-3x3": {
    title: "The 3×3 desk: minimal for remote work",
    intro:
      "Three depth layers, three horizontal zones — a simple formula for a desk that stays out of your way.",
    body: [
      {
        type: "p",
        text: "Splitting the desk 3×3 (three layers of depth × three zones from left to right) keeps everything organized without adding drawers.",
      },
    ],
  },
  "magsafe-explained": {
    title: "MagSafe explained: more than magnets",
    intro:
      "Why 15W magnetic charging can be easier to live with than ordinary Qi wireless.",
    body: [
      {
        type: "p",
        text: "MagSafe uses a magnet array that guarantees alignment with the charging coil — efficiency goes up, heat goes down.",
      },
    ],
  },
  "audio-untuk-keseharian": {
    title: "Everyday audio: codecs, ANC, and trade-offs",
    intro:
      "Choosing earbuds that work for the commute, the desk, and the gym — without trade-offs you will regret.",
    body: [
      {
        type: "p",
        text: "LDAC delivers the highest bitrate on Android. AAC is Apple's default and is more than enough for most listening.",
      },
    ],
  },
  "edisi-01-behind-the-scene": {
    title: "Edition 01: behind the shoot",
    intro:
      "How we picked the location and the props for the first Noblekase edition.",
    body: [
      {
        type: "p",
        text: "Every edition has a story of its own. Edition 01 took a bright-morning mood with a cream and navy palette.",
      },
    ],
  },
  "mitos-charging": {
    title: "Five charging myths worth forgetting",
    intro:
      "Does charging overnight ruin the battery? Does going to 100% wear it out faster? Let us set the record straight.",
    body: [
      {
        type: "p",
        text: "Modern lithium-ion packs manage their own power and switch to trickle-charging once full — they do not overcharge.",
      },
    ],
  },
  "packaging-ramah-lingkungan": {
    title: "Eco-friendly packaging: the choice we made",
    intro:
      "Why Noblekase went with plastic-free FSC paper, and the trade-offs that came with it.",
    body: [
      {
        type: "p",
        text: "Shrink-wrap is convenient but unkind to the environment. We chose FSC paper that can be recycled.",
      },
    ],
  },
};

// --- FAQ (kunci: pertanyaan versi Indonesia) — field lokal: question, answer ---
const faqEN: { id: string; question: string; answer: string }[] = [
  {
    id: "Apakah Noblekase menjual langsung dari website?",
    question: "Does Noblekase sell directly from the website?",
    answer:
      "Not yet. For now every product is sold through marketplaces (Tokopedia, Shopee, TikTok Shop, Lazada). Use the marketplace buttons on any product page to buy.",
  },
  {
    id: "Berapa lama pengiriman?",
    question: "How long does shipping take?",
    answer:
      "Shipping is handled by each marketplace. Orders through Shopee Express or Tokopedia Now! usually arrive within 1-2 days in major cities.",
  },
  {
    id: "Bagaimana kebijakan garansi?",
    question: "What is the warranty policy?",
    answer:
      "Every Noblekase product carries a 12-month warranty against manufacturing defects. Claims are processed through the marketplace you bought from — just include the invoice.",
  },
  {
    id: "Apakah ada outlet fisik?",
    question: "Is there a physical store?",
    answer:
      "Not yet. We focus on online distribution to keep prices competitive. A few products are on display at selected co-working partners.",
  },
  {
    id: "Bagaimana kerjasama bisnis / B2B?",
    question: "How do partnerships and B2B work?",
    answer:
      "For corporate orders, bulk gifting, or content collaborations — email halo@noblekase.com with the subject 'B2B Inquiry'.",
  },
];

// --- FAQ categories (kunci: slug) — field lokal: name ---
const faqCategoryEN: Record<string, string> = { umum: "General" };

// --- Hero editions (kunci: label, field non-lokal) ---
const heroEditionEN: Record<
  string,
  { eyebrow: string; headline: string; subheadline: string; ctaLabel: string }
> = {
  "Edisi Mei 2026": {
    eyebrow: "Edition · May 2026",
    headline: "Accessories that keep up with everyday life.",
    subheadline:
      "Consistent quality. Design that stands out. Available to everyone.",
    ctaLabel: "Explore products",
  },
};

// --- Slides (kunci: label, field non-lokal) ---
const slideEN: Record<
  string,
  { eyebrow: string; headline: string; subheadline: string; ctaLabel: string }
> = {
  "Slide 01 — Edisi": {
    eyebrow: "EDITION · MAY 2026",
    headline: "Accessories that keep up with everyday life.",
    subheadline:
      "Consistent quality, sensible prices. Available on your preferred marketplace.",
    ctaLabel: "Explore products",
  },
  "Slide 02 — Charger & Power": {
    eyebrow: "CHARGER & POWER",
    headline: "Power that does not keep you waiting.",
    subheadline: "Compact GaN, and a power bank that lasts the whole day.",
    ctaLabel: "See Charger & Power",
  },
  "Slide 03 — Audio & Casing": {
    eyebrow: "AUDIO & CASES",
    headline: "A quieter way to travel.",
    subheadline: "Earbuds, speakers, and cases with a clean finish.",
    ctaLabel: "See Audio & Cases",
  },
};

// --- Featured collection (satu dokumen aktif) ---
const featuredEN = {
  eyebrow: "This Edition’s Story",
  headline: "For Mobile Workers",
  subheadline: "A curated set for working from anywhere",
};

// --- Header & Footer: label dicocokkan lewat `url` (non-lokal) ---
/**
 * Label Indonesia untuk menu, dipakai sebagai PEMULIH.
 *
 * Menjalankan versi awal script ini sempat mengosongkan label ID (lihat
 * penjelasan di ensureIndonesianBaseline). Karena global-nya kini sudah ada di
 * database, `defaultValue` tidak lagi menolong saat dibaca — nilainya harus
 * ditulis ulang secara eksplisit. Peta ini yang melakukannya, dan tidak
 * berpengaruh apa-apa bila labelnya sudah terisi.
 */
const headerNavID: Record<string, string> = {
  "/": "Beranda",
  "/produk": "Produk",
  "/tentang": "Tentang",
  "/journal": "Journal",
  "/dukungan": "Dukungan",
  "#more": "Lainnya",
  "#": "", // slot logo tengah di bottom nav — memang tanpa label
};

const headerNavEN: Record<string, string> = {
  "/": "Home",
  "/produk": "Products",
  "/tentang": "About",
  "/journal": "Journal",
  "/dukungan": "Support",
  "#more": "More",
  "#": "", // slot logo tengah di bottom nav — memang tanpa label
};

const footerColumnTitleEN: Record<string, string> = {
  Produk: "Products",
  Kategori: "Categories",
  Perusahaan: "Company",
  Sosial: "Social",
  Bantuan: "Support",
  Dukungan: "Support",
  Informasi: "Information",
  Legal: "Legal",
};

/** Label link footer per URL — mengikuti kamus UI di src/lib/i18n.ts. */
const footerLinkEN: Record<string, string> = {
  "/": "Home",
  "/produk": "All products",
  "/produk/charger-power": "Charger & Power",
  "/produk/kabel-konektor": "Cables & Connectors",
  "/produk/holder-stand": "Holders & Stands",
  "/produk/audio-casing": "Audio & Cases",
  "/tentang": "About",
  "/journal": "Journal",
  "/dukungan": "Support",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/sitemap.xml": "Sitemap",
};

// --- Halaman Pages (kunci: slug). Blok dicocokkan per indeks + blockType. ---
type BlockEN =
  | {
      blockType: "hero";
      eyebrow?: string;
      headline: string;
      subheadline?: string;
    }
  | { blockType: "story"; eyebrow?: string; headline?: string; body?: string }
  | { blockType: "cta"; headline: string; buttonLabel: string }
  | {
      blockType: "numberedList" | "pillars";
      eyebrow?: string;
      headline?: string;
      items?: { title: string; description?: string }[];
    };

const LEGAL_ITEM_NOTE_EN =
  "Auto-generated outline — replace this with your final copy in Admin → Editorial → Pages.";

const pageEN: Record<string, { title: string; blocks: BlockEN[] }> = {
  tentang: {
    title: "About Noblekase",
    blocks: [
      {
        blockType: "hero",
        eyebrow: "About",
        headline: "Accessories that keep up with everyday life.",
        subheadline:
          "Noblekase started from a simple need: cables that do not fray, chargers that stay small, and cases that last. We believe consistent quality should not carry a premium.",
      },
      {
        blockType: "story",
        eyebrow: "01",
        headline: "Vision",
        body: "Everyday accessories that are well made and well designed, without paying a premium for them.",
      },
      {
        blockType: "story",
        eyebrow: "02",
        headline: "Process",
        body: "We work with suppliers held to strict testing standards, audit materials regularly, and favor packaging with as little plastic as possible.",
      },
      {
        blockType: "story",
        eyebrow: "03",
        headline: "Value",
        body: "Not a luxury brand, and not a throwaway one. Noblekase sits in between — affordable, durable, and designed with taste.",
      },
      {
        blockType: "cta",
        headline: "Start with the collection, or with our story",
        buttonLabel: "See all products →",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    blocks: [
      {
        blockType: "hero",
        eyebrow: "Legal",
        headline: "Privacy Policy",
        subheadline:
          "This page explains how Noblekase collects, uses, and protects your data.",
      },
      {
        blockType: "numberedList",
        eyebrow: "Page Contents",
        headline: "Sections still to be completed",
        items: [
          { title: "The data we collect", description: LEGAL_ITEM_NOTE_EN },
          { title: "How the data is used", description: LEGAL_ITEM_NOTE_EN },
          { title: "Cookies & analytics", description: LEGAL_ITEM_NOTE_EN },
          {
            title: "Third parties (marketplaces & analytics services)",
            description: LEGAL_ITEM_NOTE_EN,
          },
          {
            title: "Your rights over your data",
            description: LEGAL_ITEM_NOTE_EN,
          },
          { title: "Contact", description: LEGAL_ITEM_NOTE_EN },
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    blocks: [
      {
        blockType: "hero",
        eyebrow: "Legal",
        headline: "Terms & Conditions",
        subheadline:
          "Terms of use for the Noblekase site. Purchases are subject to the terms of each marketplace.",
      },
      {
        blockType: "numberedList",
        eyebrow: "Page Contents",
        headline: "Sections still to be completed",
        items: [
          { title: "Using the site", description: LEGAL_ITEM_NOTE_EN },
          {
            title: "Product information & availability",
            description: LEGAL_ITEM_NOTE_EN,
          },
          {
            title: "Buying through marketplaces",
            description: LEGAL_ITEM_NOTE_EN,
          },
          { title: "Warranty", description: LEGAL_ITEM_NOTE_EN },
          { title: "Intellectual property", description: LEGAL_ITEM_NOTE_EN },
          { title: "Changes to these terms", description: LEGAL_ITEM_NOTE_EN },
        ],
      },
    ],
  },
};

// --- Kanal Dukungan (kunci: icon, field non-lokal) ---
const supportChannelEN: Record<
  string,
  { title: string; description: string; buttonLabel: string }
> = {
  "message-circle": {
    title: "WhatsApp",
    description: "Fastest reply (~15 minutes during business hours)",
    buttonLabel: "Chat on WhatsApp",
  },
  instagram: {
    title: "Instagram",
    description: "@noblekase — DM us with questions & feedback",
    buttonLabel: "Open Instagram",
  },
  music: {
    title: "TikTok",
    description: "@noblekase — videos and behind the scenes",
    buttonLabel: "Open TikTok",
  },
  mail: {
    title: "Email",
    description: "halo@noblekase.com — for partnerships & B2B",
    buttonLabel: "Send an email",
  },
};

// ==================================================================
// MAIN
// ==================================================================
const run = async () => {
  const payload = await getPayload({ config });

  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  const done = (detail: string) => {
    payload.logger.info(`   ✓ ${detail}`);
    updated++;
  };
  const missing = (detail: string) => {
    payload.logger.warn(`   ⚠ Dilewati — tidak ditemukan: ${detail}`);
    skipped++;
  };
  /**
   * Jalankan satu bagian secara terisolasi.
   *
   * Tanpa ini, satu kegagalan (mis. satu field wajib yang kosong) menghentikan
   * seluruh script, sehingga bagian sesudahnya tidak pernah dijalankan dan
   * masalah lain baru ketahuan satu per satu di percobaan berikutnya. Dengan
   * dibungkus begini, semua bagian tetap jalan dan seluruh error terkumpul di
   * ringkasan akhir.
   */
  const step = async (title: string, body: () => Promise<void>) => {
    payload.logger.info(`\n→ ${title}`);
    try {
      await body();
    } catch (err) {
      failures.push(
        `${title}: ${err instanceof Error ? err.message : String(err)}`,
      );
      payload.logger.error(`   ✖ Gagal — ${title}`);
      payload.logger.error(err);
    }
  };

  /**
   * Pastikan sebuah global BENAR-BENAR sudah tersimpan di database untuk
   * bahasa Indonesia, sebelum locale Inggris ditulis.
   *
   * Kenapa ini perlu — dan ini penyebab bug yang bikin menu navbar ID kosong:
   *
   * Payload menerapkan `defaultValue` saat MEMBACA global yang belum pernah
   * disimpan (lihat komentar di payload/dist/fields/hooks/afterRead/promise.js:
   * "Set defaultValue on the field for globals being returned without being
   * first created"). Jadi Header terlihat berisi menu lengkap, padahal barisnya
   * belum ada satu pun di database — dan baris hasil defaultValue tidak punya
   * `id`.
   *
   * Ketika locale EN ditulis lebih dulu, global-nya baru tercipta saat itu,
   * berisi HANYA nilai Inggris. Baris array masuk tanpa pasangan ID karena
   * Payload mencocokkan baris lama-baru lewat `id` (getExistingRowDoc) — dan
   * baris kiriman kita tidak punya id untuk dicocokkan. Sejak global itu ada
   * di database, `defaultValue` tidak lagi dipakai saat membaca, sehingga
   * bahasa Indonesia berubah jadi kosong.
   *
   * Solusinya dua langkah: simpan dulu isi bacaan ID apa adanya (menjadikan
   * defaultValue sebagai baris nyata, lengkap dengan id), baru tulis EN dengan
   * membawa id baris tersebut sehingga Payload menggabungkan, bukan mengganti.
   */
  const SYSTEM_FIELDS = new Set([
    "id",
    "globalType",
    "createdAt",
    "updatedAt",
    "_status",
  ]);

  async function ensureIndonesianBaseline(slug: GlobalSlug) {
    const current = (await payload.findGlobal({
      slug,
      locale: "id",
      depth: 0,
      fallbackLocale: false,
    })) as unknown as Record<string, unknown>;

    const data = Object.fromEntries(
      Object.entries(current).filter(([key]) => !SYSTEM_FIELDS.has(key)),
    );

    if (Object.keys(data).length === 0) return;

    await payload.updateGlobal({ slug, locale: "id", data: data as never });
  }

  /** Ambil satu dokumen pada locale Indonesia (sumber nilai non-lokal). */
  async function findOne<C extends CollectionSlug>(
    collection: C,
    where: Where,
  ) {
    const res = await payload.find({
      collection,
      where,
      limit: 1,
      depth: 0,
      locale: "id",
      overrideAccess: true,
    });
    return res.docs[0];
  }

  // ----------------------------------------------------------------
  // 1. Categories & Sub-categories
  // ----------------------------------------------------------------
  await step("Categories", async () => {
    for (const [slug, tr] of Object.entries(categoryEN)) {
      const doc = await findOne("categories", { slug: { equals: slug } });
      if (!doc) {
        missing(`categories/${slug}`);
        continue;
      }
      await payload.update({
        collection: "categories",
        id: doc.id,
        locale: "en",
        data: { name: tr.name, description: tr.description },
      });
      done(`categories/${slug}`);
    }
  });

  await step("Sub-categories", async () => {
    for (const [slug, name] of Object.entries(subCategoryEN)) {
      const doc = await findOne("sub-categories", { slug: { equals: slug } });
      if (!doc) {
        missing(`sub-categories/${slug}`);
        continue;
      }
      await payload.update({
        collection: "sub-categories",
        id: doc.id,
        locale: "en",
        data: { name },
      });
      done(`sub-categories/${slug}`);
    }
  });

  // ----------------------------------------------------------------
  // 2. Products
  // `specs` adalah array: barisnya dikirim ulang lengkap dengan `id`
  // agar tidak dihapus-buat ulang. `marketplaceLinks` TIDAK disentuh —
  // benefitLabel/statusLabel di sana bukan field lokal.
  // ----------------------------------------------------------------
  await step("Products", async () => {
    for (const [slug, tr] of Object.entries(productEN)) {
      const doc = await findOne("products", { slug: { equals: slug } });
      if (!doc) {
        missing(`products/${slug}`);
        continue;
      }
      const specs = (doc.specs ?? []).map((row, i) => ({
        id: row.id,
        label: tr.specs[i]?.label ?? row.label,
        value: tr.specs[i]?.value ?? row.value,
      }));
      if (specs.length !== tr.specs.length) {
        payload.logger.warn(
          `   ⚠ products/${slug}: jumlah spec berbeda (DB ${specs.length}, terjemahan ${tr.specs.length}) — hanya yang cocok yang diterjemahkan.`,
        );
      }
      await payload.update({
        collection: "products",
        id: doc.id,
        locale: "en",
        data: {
          name: tr.name,
          tagline: tr.tagline,
          storyEyebrow: PRODUCT_STORY_EYEBROW_EN,
          storyHeadline: tr.tagline, // seed.ts memakai tagline sebagai storyHeadline
          storyBody: rt(tr.story),
          ...(specs.length > 0 ? { specs } : {}),
        },
      });
      done(`products/${slug}`);
    }
  });

  // ----------------------------------------------------------------
  // 3. Article categories & Articles
  // ----------------------------------------------------------------
  await step("Article categories", async () => {
    for (const [slug, name] of Object.entries(articleCategoryEN)) {
      const doc = await findOne("article-categories", {
        slug: { equals: slug },
      });
      if (!doc) {
        missing(`article-categories/${slug}`);
        continue;
      }
      await payload.update({
        collection: "article-categories",
        id: doc.id,
        locale: "en",
        data: { name },
      });
      done(`article-categories/${slug}`);
    }
  });

  await step("Articles", async () => {
    for (const [slug, tr] of Object.entries(articleEN)) {
      const doc = await findOne("articles", { slug: { equals: slug } });
      if (!doc) {
        missing(`articles/${slug}`);
        continue;
      }
      await payload.update({
        collection: "articles",
        id: doc.id,
        locale: "en",
        data: { title: tr.title, intro: tr.intro, body: rtBlocks(tr.body) },
      });
      done(`articles/${slug}`);
    }
  });

  // ----------------------------------------------------------------
  // 4. FAQ
  // FAQ item tidak punya slug, jadi dicocokkan lewat teks pertanyaan
  // versi Indonesia (dibaca pada locale "id").
  // ----------------------------------------------------------------
  await step("FAQ categories", async () => {
    for (const [slug, name] of Object.entries(faqCategoryEN)) {
      const doc = await findOne("faq-categories", { slug: { equals: slug } });
      if (!doc) {
        missing(`faq-categories/${slug}`);
        continue;
      }
      await payload.update({
        collection: "faq-categories",
        id: doc.id,
        locale: "en",
        data: { name },
      });
      done(`faq-categories/${slug}`);
    }
  });

  await step("FAQ items", async () => {
    for (const tr of faqEN) {
      const doc = await findOne("faq-items", { question: { equals: tr.id } });
      if (!doc) {
        missing(`faq-items "${tr.id}"`);
        continue;
      }
      await payload.update({
        collection: "faq-items",
        id: doc.id,
        locale: "en",
        data: { question: tr.question, answer: rt(tr.answer) },
      });
      done(`faq-items "${tr.question}"`);
    }
  });

  // ----------------------------------------------------------------
  // 5. Hero editions, Slides, Featured collection
  // ----------------------------------------------------------------
  await step("Hero editions", async () => {
    for (const [label, tr] of Object.entries(heroEditionEN)) {
      const doc = await findOne("hero-editions", { label: { equals: label } });
      if (!doc) {
        missing(`hero-editions "${label}"`);
        continue;
      }
      await payload.update({
        collection: "hero-editions",
        id: doc.id,
        locale: "en",
        data: {
          eyebrow: tr.eyebrow,
          headline: tr.headline,
          subheadline: tr.subheadline,
          ctaLabel: tr.ctaLabel,
        },
      });
      done(`hero-editions "${label}"`);
    }
  });

  await step("Slides", async () => {
    for (const [label, tr] of Object.entries(slideEN)) {
      const doc = await findOne("slides", { label: { equals: label } });
      if (!doc) {
        missing(`slides "${label}"`);
        continue;
      }
      await payload.update({
        collection: "slides",
        id: doc.id,
        locale: "en",
        data: {
          eyebrow: tr.eyebrow,
          headline: tr.headline,
          subheadline: tr.subheadline,
          ctaLabel: tr.ctaLabel,
        },
      });
      done(`slides "${label}"`);
    }
  });

  await step("Featured collection", async () => {
    {
      const doc = await findOne("featured-collections", {
        isActive: { equals: true },
      });
      if (!doc) {
        missing("featured-collections (isActive = true)");
      } else {
        await payload.update({
          collection: "featured-collections",
          id: doc.id,
          locale: "en",
          data: featuredEN,
        });
        done("featured-collections (aktif)");
      }
    }
  });

  // ----------------------------------------------------------------
  // 6. Marketplaces — TIDAK diterjemahkan.
  // Semua field-nya (name, slug, baseUrl, color, order, status) non-lokal,
  // dan nama marketplace adalah nama merek yang tidak diterjemahkan.
  // ----------------------------------------------------------------
  await step("Marketplaces", async () => {
    payload.logger.info(
      "   • Dilewati: tidak ada field localized (nama merek tetap sama).",
    );
  });

  // ----------------------------------------------------------------
  // 7. Pages (tentang, privacy, terms)
  // Blok halaman dikirim ulang utuh: `id`, `blockType`, dan field
  // non-lokal (image, alignment, imagePosition, buttonUrl, icon)
  // disalin apa adanya dari locale id.
  // ----------------------------------------------------------------
  await step("Pages", async () => {
    for (const [slug, tr] of Object.entries(pageEN)) {
      const doc = await findOne("pages", { slug: { equals: slug } });
      if (!doc) {
        missing(`pages/${slug}`);
        continue;
      }

      const blocks: NonNullable<Page["blocks"]> = (doc.blocks ?? []).map(
        (block, i) => {
          const t = tr.blocks[i];
          if (!t || t.blockType !== block.blockType) {
            payload.logger.warn(
              `   ⚠ pages/${slug}: blok #${i + 1} (${block.blockType}) tidak punya pasangan terjemahan — dibiarkan apa adanya.`,
            );
            return block;
          }

          if (block.blockType === "hero" && t.blockType === "hero") {
            return {
              ...block,
              eyebrow: t.eyebrow,
              headline: t.headline,
              subheadline: t.subheadline,
            };
          }
          if (block.blockType === "story" && t.blockType === "story") {
            return {
              ...block,
              eyebrow: t.eyebrow,
              headline: t.headline,
              body: t.body ? rt(t.body) : block.body,
            };
          }
          if (block.blockType === "cta" && t.blockType === "cta") {
            return {
              ...block,
              headline: t.headline,
              buttonLabel: t.buttonLabel,
            };
          }
          if (
            (block.blockType === "numberedList" ||
              block.blockType === "pillars") &&
            (t.blockType === "numberedList" || t.blockType === "pillars")
          ) {
            const items = (block.items ?? []).map((row, j) => ({
              ...row,
              title: t.items?.[j]?.title ?? row.title,
              description: t.items?.[j]?.description ?? row.description,
            }));
            return {
              ...block,
              eyebrow: t.eyebrow,
              headline: t.headline,
              items,
            };
          }
          return block;
        },
      );

      await payload.update({
        collection: "pages",
        id: doc.id,
        locale: "en",
        data: { title: tr.title, blocks },
      });
      done(`pages/${slug}`);
    }
  });

  // ----------------------------------------------------------------
  // 8. Global: Header
  // navItems & mobileBottomNav dicocokkan lewat `url` (non-lokal).
  // ----------------------------------------------------------------
  await step("Global: Header", async () => {
    await ensureIndonesianBaseline("header");

    const read = async () =>
      payload.findGlobal({ slug: "header", locale: "id", depth: 0 });

    const before = await read();
    if (
      (before.navItems ?? []).length === 0 &&
      (before.mobileBottomNav ?? []).length === 0
    ) {
      missing("header (navItems & mobileBottomNav masih kosong)");
      return;
    }

    // Langkah 1 — pulihkan label Indonesia yang mungkin kosong.
    await payload.updateGlobal({
      slug: "header",
      locale: "id",
      data: {
        navItems: (before.navItems ?? []).map((row) => ({
          ...row,
          label: row.label || headerNavID[row.url] || row.label,
        })),
        mobileBottomNav: (before.mobileBottomNav ?? []).map((row) => ({
          ...row,
          label: row.label || headerNavID[row.url] || row.label,
        })),
      },
    });

    // Langkah 2 — baca ulang supaya tiap baris array membawa `id`; tanpa itu
    // Payload mengganti baris, bukan menggabungkan, dan bahasa Indonesia
    // kembali hilang saat locale EN ditulis.
    const persisted = await read();

    const navItems = (persisted.navItems ?? []).map((row) => ({
      ...row,
      label: headerNavEN[row.url] ?? row.label,
    }));
    const mobileBottomNav = (persisted.mobileBottomNav ?? []).map((row) => ({
      ...row,
      label: headerNavEN[row.url] ?? row.label,
    }));

    await payload.updateGlobal({
      slug: "header",
      locale: "en",
      data: { navItems, mobileBottomNav },
    });
    done(
      `header (${navItems.length} nav, ${mobileBottomNav.length} bottom nav)`,
    );
  });

  // ----------------------------------------------------------------
  // 9. Global: Footer
  // `copyrightText` tidak lokal — sengaja tidak dikirim.
  // ----------------------------------------------------------------
  await step("Global: Footer", async () => {
    await ensureIndonesianBaseline("footer");

    const read = async () =>
      payload.findGlobal({ slug: "footer", locale: "id", depth: 0 });

    const before = await read();

    // Langkah 1 — simpan ulang array apa adanya di locale ID supaya setiap
    // baris punya `id` di database. Nilai tidak diubah; ini murni penjangkaran.
    if (
      (before.columns ?? []).length > 0 ||
      (before.legalLinks ?? []).length > 0
    ) {
      await payload.updateGlobal({
        slug: "footer",
        locale: "id",
        data: {
          ...(before.columns ? { columns: before.columns } : {}),
          ...(before.legalLinks ? { legalLinks: before.legalLinks } : {}),
        },
      });
    }

    // Langkah 2 — baca ulang agar `id` tiap baris ikut terbawa saat menulis EN.
    const persisted = await read();

    const columns = (persisted.columns ?? []).map((col) => ({
      ...col,
      title: footerColumnTitleEN[col.title] ?? col.title,
      links: (col.links ?? []).map((link) => ({
        ...link,
        label: footerLinkEN[link.url] ?? link.label,
      })),
    }));
    const legalLinks = (persisted.legalLinks ?? []).map((link) => ({
      ...link,
      label: footerLinkEN[link.url] ?? link.label,
    }));

    await payload.updateGlobal({
      slug: "footer",
      locale: "en",
      data: {
        tagline: "Accessories that keep up with everyday life.",
        ...(columns.length > 0 ? { columns } : {}),
        ...(legalLinks.length > 0 ? { legalLinks } : {}),
      },
    });
    done(`footer (${columns.length} kolom, ${legalLinks.length} legal link)`);
  });

  // ----------------------------------------------------------------
  // 10. Global: Site Settings
  // siteName, logo, favicon, defaultOgImage, googleSiteVerification,
  // chatbotGreetingId/En tidak lokal — sengaja tidak dikirim.
  // ----------------------------------------------------------------
  await step("Global: Site Settings", async () => {
    await ensureIndonesianBaseline("site-settings");
    await payload.updateGlobal({
      slug: "site-settings",
      locale: "en",
      data: {
        tagline: "Accessories that keep up with everyday life.",
        defaultMetaTitle: "· Noblekase",
        defaultMetaDescription:
          "A phone accessories brand built on consistent quality and editorial design, made for everyone.",
        chatbotTitle: "Noblekase AI Assistant",
        chatbotStatusText: "Online · 24/7",
        chatbotInputPlaceholder: "Type your question...",
      },
    });
    done("site-settings");
  });

  // ----------------------------------------------------------------
  // 11. Global halaman: page-home
  // Gambar (brandImage, promoImage) & URL CTA tidak lokal — tidak dikirim.
  // ----------------------------------------------------------------
  await step("Global: Beranda (page-home)", async () => {
    await ensureIndonesianBaseline("page-home");
    await payload.updateGlobal({
      slug: "page-home",
      locale: "en",
      data: {
        categoryEyebrow: "Pick a Category",
        categoryHeadline: "Start with what you need",
        journalEyebrow: "From the Journal",
        journalHeadline: "Latest stories & guides",
        brandEyebrow: "About Noblekase",
        brandHeadline: "More than an accessory",
        brandBody:
          "We believe everyone deserves well-made, well-designed accessories — without paying a premium for it.",
        brandCtaLabel: "Read more",
        productsEyebrow: "Collection",
        productsHeadline: "Picks for your everyday",
        tabNewLabel: "Newest",
        tabBestLabel: "Best sellers",
        tabAllLabel: "All",
        promoEyebrow: "Current Edition",
        promoHeadline: "Daily essentials, in one set",
        promoCtaLabel: "Explore the collection",
        seeAllLabel: "View all →",
      },
    });
    done("page-home");
  });

  // ----------------------------------------------------------------
  // 12. Global halaman: page-products
  // ----------------------------------------------------------------
  await step("Global: Listing Produk (page-products)", async () => {
    await ensureIndonesianBaseline("page-products");
    await payload.updateGlobal({
      slug: "page-products",
      locale: "en",
      data: {
        eyebrow: "Collection",
        headline: "All Noblekase products",
        intro:
          "Four categories for your everyday. Pricing lives on your preferred marketplace — we look after the collection and the consistency of its quality.",
        countTemplate: "Showing {count} products",
        sortLabel: "Sort: Default",
        seeAllLabel: "View all →",
        filterCategoryTitle: "Category",
        filterAllLabel: "All products",
        filterMarketplaceTitle: "Marketplace",
        filterDisclaimer:
          "Prices are shown on each marketplace. We curate the collection — the marketplace decides promos and shipping.",
      },
    });
    done("page-products");
  });

  // ----------------------------------------------------------------
  // 13. Global halaman: page-journal
  // ----------------------------------------------------------------
  await step("Global: Journal (page-journal)", async () => {
    await ensureIndonesianBaseline("page-journal");
    await payload.updateGlobal({
      slug: "page-journal",
      locale: "en",
      data: {
        eyebrow: "Journal",
        headline: "Stories & guides from Noblekase",
        intro:
          "Unpacked slowly: how to pick the right charger, why we chose FSC paper, and the story behind every edition.",
        highlightLabel: "Highlight",
        readMoreLabel: "Read more →",
        allArticlesEyebrow: "All Articles",
        countTemplate: "{count} stories",
      },
    });
    done("page-journal");
  });

  // ----------------------------------------------------------------
  // 14. Global halaman: page-product-detail
  // Placeholder {product} dipertahankan karena dibaca oleh frontend.
  // ----------------------------------------------------------------
  await step("Global: Detail Produk (page-product-detail)", async () => {
    await ensureIndonesianBaseline("page-product-detail");
    await payload.updateGlobal({
      slug: "page-product-detail",
      locale: "en",
      data: {
        breadcrumbHome: "Home",
        breadcrumbProducts: "Products",
        marketplaceSectionLabel: "Buy on your preferred marketplace",
        badgeBestPrice: "Best price",
        badgeFastShip: "Fast shipping",
        badgeNew: "Just released",
        whatsappCtaLabel: "Ask via WhatsApp →",
        storyLabel: "Product Story",
        specsLabel: "Specifications",
        lifestyleEyebrow: "In Everyday Use",
        lifestyleHeadingSuffix: " on an ordinary day",
        relatedEyebrow: "You might also like",
        relatedHeadline: "Products often paired together",
        stickyCtaTemplate: "Buy {product}",
      },
    });
    done("page-product-detail");
  });

  // ----------------------------------------------------------------
  // 15. Global halaman: page-article-detail
  // Placeholder {category} dipertahankan.
  // ----------------------------------------------------------------
  await step("Global: Detail Artikel (page-article-detail)", async () => {
    await ensureIndonesianBaseline("page-article-detail");
    await payload.updateGlobal({
      slug: "page-article-detail",
      locale: "en",
      data: {
        breadcrumbHome: "Home",
        breadcrumbJournal: "Journal",
        shareLabel: "Share:",
        backLabel: "← Back to Journal",
        relatedEyebrow: "Related articles",
        relatedHeadlineTemplate: "More stories from {category}",
      },
    });
    done("page-article-detail");
  });

  // ----------------------------------------------------------------
  // 16. Global halaman: page-support
  // Baris `channels` dikirim ulang lengkap (id, icon, url dipertahankan);
  // heroImage tidak lokal sehingga tidak ikut dikirim.
  // ----------------------------------------------------------------
  await step("Global: Dukungan (page-support)", async () => {
    await ensureIndonesianBaseline("page-support");
    {
      const support = await payload.findGlobal({
        slug: "page-support",
        locale: "id",
        depth: 0,
      });
      const channels = (support.channels ?? []).map((row) => {
        const tr = row.icon ? supportChannelEN[row.icon] : undefined;
        if (!tr) {
          payload.logger.warn(
            `   ⚠ page-support: kanal "${row.title}" (icon: ${row.icon ?? "-"}) tanpa terjemahan — dibiarkan apa adanya.`,
          );
          return row;
        }
        return {
          ...row,
          title: tr.title,
          description: tr.description,
          buttonLabel: tr.buttonLabel,
        };
      });

      await payload.updateGlobal({
        slug: "page-support",
        locale: "en",
        data: {
          heroEyebrow: "Support",
          heroHeadline: "Let us help you",
          heroIntro:
            "A small team that reads every message. WhatsApp is fastest during business hours, or DM us on Instagram anytime.",
          channelsEyebrow: "Channels",
          channelsHeadline: "Pick whichever is easiest for you",
          ...(channels.length > 0 ? { channels } : {}),
          operatingHours:
            "Business hours: Mon–Fri 09.00–17.00 WIB · Sat 10.00–14.00",
          faqEyebrow: "FAQ",
          faqHeadline: "Frequently asked questions",
        },
      });
      done(`page-support (${channels.length} kanal)`);
    }
  });

  // ----------------------------------------------------------------
  // Ringkasan
  // ----------------------------------------------------------------
  payload.logger.info("");
  payload.logger.info(
    `✅ Terjemahan EN selesai — ${updated} bagian diperbarui, ${skipped} dilewati.`,
  );
  if (skipped > 0) {
    payload.logger.warn(
      "Ada bagian yang dilewati. Biasanya karena konten terkait belum di-seed — jalankan `pnpm seed` & `pnpm seed:content` lebih dulu, lalu ulangi script ini.",
    );
  }
  if (failures.length > 0) {
    payload.logger.error(`\n${failures.length} bagian GAGAL:`);
    for (const f of failures) payload.logger.error(`   ✖ ${f}`);
    process.exit(1);
  }
  process.exit(0);
};

try {
  await run();
} catch (err) {
  console.error("❌ Seed terjemahan gagal:", err);
  process.exit(1);
}
