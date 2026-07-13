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
          },
          {
            blockType: "story",
            eyebrow: "01",
            headline: "Visi",
            body: rt(
              "Aksesoris harian yang berkualitas dan terdesain baik, tanpa harus mengeluarkan biaya berlebihan.",
            ),
            imagePosition: "left",
          },
          {
            blockType: "story",
            eyebrow: "02",
            headline: "Proses",
            body: rt(
              "Kami memilih supplier dengan standar pengujian ketat, mengaudit material secara berkala, dan memprioritaskan packaging yang minim plastik.",
            ),
            imagePosition: "right",
          },
          {
            blockType: "story",
            eyebrow: "03",
            headline: "Value",
            body: rt(
              "Bukan brand mewah, bukan juga produk asal-asalan. Noblekase berdiri di tengah — terjangkau, awet, dan didesain dengan rasa.",
            ),
            imagePosition: "left",
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
        a: "Untuk korporat order, gift bulk, atau kolaborasi konten — kontak halo@noblekase.com dengan subject 'B2B Inquiry'.",
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
          description: "halo@noblekase.com — untuk kerjasama & B2B",
          buttonLabel: "Kirim Email",
          url: "mailto:halo@noblekase.com",
        },
      ],
    },
  });
  payload.logger.info("Updated: channel Dukungan (PageSupport)");

  payload.logger.info("✅ Seed konten selesai.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed konten gagal:", err);
  process.exit(1);
});
