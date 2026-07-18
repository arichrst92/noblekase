/**
 * seedContent.ts — seed konten Sprint 2 (idempotent): halaman Tentang (Pages),
 * FAQ (kategori + item), dan channel Dukungan (global PageSupport).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Jalankan:  pnpm seed:content   (aman diulang — tidak membuat duplikat)
 */

import fs from "fs";
import path from "path";

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

// Lexical richText dari plain string
function textNode(text: string) {
  return { detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 };
}
function paragraph(text: string) {
  return { children: [textNode(text)], direction: "ltr", format: "", indent: 0, textFormat: 0, type: "paragraph", version: 1 };
}
function rt(text: string) {
  return { root: { children: [paragraph(text)], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } };
}

const seed = async () => {
  const payload = await getPayload({ config });

  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

  /**
   * Upload gambar ke Media; pakai ulang bila filename sudah ada (anti-duplikat).
   * Penting: dokumen lama hanya dipakai ulang bila filenya BENAR-BENAR ada di
   * disk. Dokumen basi (file hilang) dihapus lalu diupload ulang — jika tidak,
   * frontend akan 500 "file is missing on the disk".
   */
  async function findOrUpload(relPath: string, alt: string): Promise<number | string | undefined> {
    const filename = path.basename(relPath);
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filename } },
      limit: 1,
    });
    if (existing.totalDocs > 0) {
      const doc = existing.docs[0] as any;
      if (doc.filename && fs.existsSync(path.join(uploadDir, doc.filename))) {
        return doc.id;
      }
      try {
        await payload.delete({ collection: "media", id: doc.id });
        payload.logger.warn(`Media basi dihapus (file hilang di disk): ${doc.filename}`);
      } catch (e) {
        payload.logger.warn(`Gagal hapus media basi ${doc.filename}: ${(e as Error).message}`);
      }
    }
    const filePath = path.resolve(process.cwd(), "public", relPath.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      payload.logger.warn(`Gambar tidak ditemukan, dilewati: ${relPath}`);
      return undefined;
    }
    const doc = await payload.create({ collection: "media", data: { alt }, filePath });
    return doc.id;
  }

  // --- 0. Upload gambar halaman statis & brand ---
  payload.logger.info("Upload gambar halaman & brand...");
  const imgTentangHero = await findOrUpload("images/tentang/tentang-hero.svg", "Tentang Noblekase");
  const imgVisi = await findOrUpload("images/tentang/tentang-01-visi.svg", "Visi Noblekase");
  const imgProses = await findOrUpload("images/tentang/tentang-02-proses.svg", "Proses Noblekase");
  const imgValue = await findOrUpload("images/tentang/tentang-03-value.svg", "Value Noblekase");
  const imgKontak = await findOrUpload("images/tentang/kontak-hero.svg", "Dukungan Noblekase");
  const imgBrand = await findOrUpload("images/hero/brand-story-tentang-noblekase.svg", "Cerita brand Noblekase");
  const imgBanner = await findOrUpload("images/hero/produk-listing-banner.svg", "Koleksi produk Noblekase");
  const imgOg = await findOrUpload("images/brand/og-image-default.svg", "Noblekase");
  const imgLogo = await findOrUpload("images/noblekase-logo.png", "Logo Noblekase");
  // Favicon mengikuti mark "K" dari logo asli (bukan lagi SVG konsep lama).
  const imgFavicon = await findOrUpload("images/brand/favicon-noblekase.png", "Favicon Noblekase");

  // --- 1. Halaman Tentang (Pages, slug "tentang") ---
  const existingTentang = await payload.find({
    collection: "pages",
    where: { slug: { equals: "tentang" } },
    limit: 1,
  });
  if (existingTentang.totalDocs === 0) {
    await payload.create({
      collection: "pages",
      data: {
        title: "Tentang Noblekase",
        slug: "tentang",
        status: "published",
        blocks: [
          {
            blockType: "hero",
            eyebrow: "Tentang",
            headline: "Aksesoris yang menemani hari-hari setiap orang.",
            subheadline:
              "Noblekase lahir dari kebutuhan sederhana: kabel yang tidak mudah rusak, charger yang ringkas, dan casing yang awet dipakai. Kami percaya kualitas yang konsisten tidak harus mahal.",
            alignment: "left",
            image: imgTentangHero,
          },
          {
            blockType: "story",
            eyebrow: "01",
            headline: "Visi",
            body: rt(
              "Aksesoris harian yang berkualitas dan terdesain baik, tanpa harus mengeluarkan biaya berlebihan.",
            ),
            imagePosition: "left",
            image: imgVisi,
          },
          {
            blockType: "story",
            eyebrow: "02",
            headline: "Proses",
            body: rt(
              "Kami memilih supplier dengan standar pengujian ketat, mengaudit material secara berkala, dan memprioritaskan packaging yang minim plastik.",
            ),
            imagePosition: "right",
            image: imgProses,
          },
          {
            blockType: "story",
            eyebrow: "03",
            headline: "Value",
            body: rt(
              "Bukan brand mewah, bukan juga produk asal-asalan. Noblekase berdiri di tengah — terjangkau, awet, dan didesain dengan rasa.",
            ),
            imagePosition: "left",
            image: imgValue,
          },
          {
            blockType: "cta",
            headline: "Mulai dari koleksi atau cerita kami",
            buttonLabel: "Lihat semua produk →",
            buttonUrl: "/produk",
          },
        ],
      },
    });
    payload.logger.info("Seeded: halaman Tentang");
  } else {
    payload.logger.info("Lewati: halaman Tentang sudah ada");
  }

  // --- 1b. Halaman legal (Privacy & Terms) — kerangka, isi wajib ditulis klien ---
  const legalPages = [
    {
      slug: "privacy",
      title: "Kebijakan Privasi",
      eyebrow: "Legal",
      intro:
        "Halaman ini menjelaskan bagaimana Noblekase mengumpulkan, memakai, dan melindungi data Anda.",
      sections: [
        "Data yang kami kumpulkan",
        "Bagaimana data digunakan",
        "Cookie & analitik",
        "Pihak ketiga (marketplace & layanan analitik)",
        "Hak Anda atas data",
        "Kontak",
      ],
    },
    {
      slug: "terms",
      title: "Syarat & Ketentuan",
      eyebrow: "Legal",
      intro:
        "Ketentuan penggunaan situs Noblekase. Pembelian produk tunduk pada ketentuan masing-masing marketplace.",
      sections: [
        "Penggunaan situs",
        "Informasi produk & ketersediaan",
        "Pembelian melalui marketplace",
        "Garansi",
        "Hak kekayaan intelektual",
        "Perubahan ketentuan",
      ],
    },
  ];

  for (const lp of legalPages) {
    const exists = await payload.find({
      collection: "pages",
      where: { slug: { equals: lp.slug } },
      limit: 1,
    });
    if (exists.totalDocs > 0) {
      payload.logger.info(`Lewati: halaman ${lp.slug} sudah ada`);
      continue;
    }
    await payload.create({
      collection: "pages",
      data: {
        title: lp.title,
        slug: lp.slug,
        status: "published",
        blocks: [
          {
            blockType: "hero",
            eyebrow: lp.eyebrow,
            headline: lp.title,
            subheadline: lp.intro,
            alignment: "center",
          },
          {
            blockType: "numberedList",
            eyebrow: "Isi Halaman",
            headline: "Bagian yang perlu dilengkapi",
            items: lp.sections.map((s) => ({
              title: s,
              description:
                "Kerangka otomatis — ganti dengan teks final Anda di Admin → Editorial → Pages.",
            })),
          },
        ],
      },
    });
    payload.logger.info(`Seeded: halaman ${lp.slug} (kerangka)`);
  }

  // --- 2. FAQ (kategori + item) ---
  const existingFaq = await payload.find({ collection: "faq-items", limit: 1 });
  if (existingFaq.totalDocs === 0) {
    let catId: number | string;
    const existingCat = await payload.find({
      collection: "faq-categories",
      where: { slug: { equals: "umum" } },
      limit: 1,
    });
    if (existingCat.totalDocs > 0) {
      catId = existingCat.docs[0].id;
    } else {
      const cat = await payload.create({
        collection: "faq-categories",
        data: { name: "Umum", slug: "umum", order: 0 },
      });
      catId = cat.id;
    }

    const faqs = [
      {
        q: "Apakah Noblekase menjual langsung dari website?",
        a: "Belum. Saat ini kami menyalurkan semua produk melalui marketplace (Tokopedia, Shopee, TikTok Shop, Lazada). Klik tombol marketplace di halaman produk untuk pembelian.",
      },
      {
        q: "Berapa lama pengiriman?",
        a: "Pengiriman ditangani oleh masing-masing marketplace. Untuk pesanan via Shopee Express atau Tokopedia Now! biasanya 1-2 hari di kota besar.",
      },
      {
        q: "Bagaimana kebijakan garansi?",
        a: "Setiap produk Noblekase memiliki garansi 12 bulan untuk cacat manufaktur. Klaim garansi diproses melalui marketplace tempat pembelian dengan menyertakan invoice.",
      },
      {
        q: "Apakah ada outlet fisik?",
        a: "Belum. Kami fokus pada distribusi online untuk menjaga harga kompetitif. Untuk pengalaman langsung, beberapa produk tersedia di display partner co-working tertentu.",
      },
      {
        q: "Bagaimana kerjasama bisnis / B2B?",
        a: "Untuk korporat order, gift bulk, atau kolaborasi konten — kontak halo@noblekase.co.id dengan subject 'B2B Inquiry'.",
      },
    ];
    let order = 0;
    for (const f of faqs) {
      await payload.create({
        collection: "faq-items",
        data: { category: catId, question: f.q, answer: rt(f.a), order: order++, status: "published" },
      });
    }
    payload.logger.info("Seeded: 5 FAQ item");
  } else {
    payload.logger.info("Lewati: FAQ sudah ada");
  }

  // --- 3. Channel Dukungan (global PageSupport) — update idempotent ---
  await payload.updateGlobal({
    slug: "page-support",
    data: {
      heroImage: imgKontak,
      channels: [
        {
          icon: "message-circle",
          title: "WhatsApp",
          description: "Respons paling cepat (~15 menit jam kerja)",
          buttonLabel: "Chat WhatsApp",
          url: "https://wa.me/6281234567890?text=Halo%20Noblekase",
        },
        {
          icon: "instagram",
          title: "Instagram",
          description: "@noblekase — DM kami untuk pertanyaan & feedback",
          buttonLabel: "Buka Instagram",
          url: "https://instagram.com/noblekase",
        },
        {
          icon: "music",
          title: "TikTok",
          description: "@noblekase — video, behind the scenes",
          buttonLabel: "Buka TikTok",
          url: "https://tiktok.com/@noblekase",
        },
        {
          icon: "mail",
          title: "Email",
          description: "halo@noblekase.co.id — untuk kerjasama & B2B",
          buttonLabel: "Kirim Email",
          url: "mailto:halo@noblekase.co.id",
        },
      ],
    },
  });
  payload.logger.info("Updated: channel + hero Dukungan (PageSupport)");

  // --- 3b. Slide carousel Beranda ---
  const existingSlides = await payload.count({ collection: "slides" });
  if (existingSlides.totalDocs === 0) {
    const slides = [
      {
        label: "Slide 01 — Edisi",
        eyebrow: "EDISI · MEI 2026",
        headline: "Aksesoris yang menemani hari-hari.",
        subheadline: "Kualitas konsisten, harga masuk akal. Tersedia di marketplace pilihan.",
        img: "images/slides/slide-01-desktop.svg",
        imgMobile: "images/slides/slide-01-mobile.svg",
        ctaLabel: "Jelajahi produk",
        ctaUrl: "/produk",
        textAlign: "left",
      },
      {
        label: "Slide 02 — Charger & Power",
        eyebrow: "CHARGER & POWER",
        headline: "Daya yang tidak bikin menunggu.",
        subheadline: "GaN ringkas, powerbank yang cukup untuk seharian.",
        img: "images/slides/slide-02-desktop.svg",
        imgMobile: "images/slides/slide-02-mobile.svg",
        ctaLabel: "Lihat Charger & Power",
        ctaUrl: "/produk/charger-power",
        textAlign: "left",
      },
      {
        label: "Slide 03 — Audio & Casing",
        eyebrow: "AUDIO & CASING",
        headline: "Teman perjalanan yang tenang.",
        subheadline: "Earbuds, speaker, dan casing dengan finishing rapi.",
        img: "images/slides/slide-03-desktop.svg",
        imgMobile: "images/slides/slide-03-mobile.svg",
        ctaLabel: "Lihat Audio & Casing",
        ctaUrl: "/produk/audio-casing",
        textAlign: "center",
      },
    ];
    let ord = 0;
    for (const s of slides) {
      const image = await findOrUpload(s.img, s.headline);
      const imageMobile = await findOrUpload(s.imgMobile, s.headline);
      if (!image) continue;
      await payload.create({
        collection: "slides",
        data: {
          label: s.label,
          eyebrow: s.eyebrow,
          headline: s.headline,
          subheadline: s.subheadline,
          image,
          ...(imageMobile ? { imageMobile } : {}),
          ctaLabel: s.ctaLabel,
          ctaUrl: s.ctaUrl,
          textAlign: s.textAlign,
          textTheme: "light",
          scrim: true,
          order: ord++,
          status: "published",
        },
      });
    }
    payload.logger.info(`Seeded: ${ord} slide carousel (full-bleed)`);
  } else {
    payload.logger.info("Lewati: slide carousel sudah ada");
  }

  // --- 4. Gambar global lain: Beranda, Listing Produk, Site Settings ---
  const imgPromo = await findOrUpload("images/hero/marketplace-cta-banner.svg", "Promo Noblekase");
  await payload.updateGlobal({
    slug: "page-home",
    data: { brandImage: imgBrand, ...(imgPromo ? { promoImage: imgPromo } : {}) },
  });
  await payload.updateGlobal({ slug: "page-products", data: { bannerImage: imgBanner } });
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      ...(imgLogo ? { logo: imgLogo } : {}),
      ...(imgFavicon ? { favicon: imgFavicon } : {}),
      ...(imgOg ? { defaultOgImage: imgOg } : {}),
    },
  });
  payload.logger.info("Updated: gambar Beranda, Listing Produk & Site Settings (logo/favicon/OG)");

  payload.logger.info("✅ Seed konten selesai.");
  process.exit(0);
};

try {
  await seed();
} catch (err) {
  console.error("❌ Seed konten gagal:", err);
  process.exit(1);
}
