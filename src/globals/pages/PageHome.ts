/**
 * PageHome — konten & label section Beranda yang tidak ditangani koleksi lain.
 * (Hero dari HeroEditions, Featured dari FeaturedCollections, produk dari Products.)
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const PageHome: GlobalConfig = {
  slug: "page-home",
  label: "Beranda (Konten)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    {
      type: "collapsible",
      label: "Section Kategori",
      fields: [
        { name: "categoryEyebrow", type: "text", localized: true, defaultValue: "Pilih Kategori" },
        { name: "categoryHeadline", type: "text", localized: true, defaultValue: "Mulai dari yang Anda butuhkan" },
      ],
    },
    {
      type: "collapsible",
      label: "Section Journal (teaser)",
      fields: [
        { name: "journalEyebrow", type: "text", localized: true, defaultValue: "Dari Journal" },
        { name: "journalHeadline", type: "text", localized: true, defaultValue: "Cerita & panduan terbaru" },
      ],
    },
    {
      type: "collapsible",
      label: "Section Brand Snippet",
      fields: [
        { name: "brandEyebrow", type: "text", localized: true, defaultValue: "Tentang Noblekase" },
        { name: "brandHeadline", type: "text", localized: true, defaultValue: "Bukan sekadar aksesoris" },
        {
          name: "brandBody",
          type: "textarea",
          localized: true,
          defaultValue:
            "Kami percaya bahwa setiap orang berhak atas aksesoris yang berkualitas dan terdesain baik—tanpa harus mengeluarkan biaya berlebihan.",
        },
        { name: "brandCtaLabel", type: "text", localized: true, defaultValue: "Selengkapnya" },
        { name: "brandCtaUrl", type: "text", defaultValue: "/tentang" },
        {
          name: "brandImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Gambar section brand snippet di Beranda",
              size: "900×1200",
              ratio: "3:4",
              prompt: "a warm brand lifestyle photo of phone accessories arranged thoughtfully on a natural surface",
            }),
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Section Produk (bertab)",
      fields: [
        { name: "productsEyebrow", type: "text", localized: true, defaultValue: "Koleksi" },
        { name: "productsHeadline", type: "text", localized: true, defaultValue: "Pilihan untuk hari-hari Anda" },
        { name: "tabNewLabel", type: "text", localized: true, defaultValue: "Terbaru" },
        { name: "tabBestLabel", type: "text", localized: true, defaultValue: "Terlaris" },
        { name: "tabAllLabel", type: "text", localized: true, defaultValue: "Semua" },
      ],
    },
    {
      type: "collapsible",
      label: "Banner Promo",
      fields: [
        { name: "promoEyebrow", type: "text", localized: true, defaultValue: "Edisi Berjalan" },
        { name: "promoHeadline", type: "text", localized: true, defaultValue: "Perlengkapan harian, satu paket" },
        { name: "promoCtaLabel", type: "text", localized: true, defaultValue: "Jelajahi koleksi" },
        { name: "promoCtaUrl", type: "text", defaultValue: "/produk" },
        {
          name: "promoImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Banner promo lebar di Beranda",
              size: "2100×900",
              ratio: "21:9",
              prompt: "a wide promotional banner featuring an assortment of phone accessories on a clean surface",
            }),
          },
        },
      ],
    },
    { name: "seeAllLabel", type: "text", localized: true, defaultValue: "Lihat semua →", admin: { description: "Label link 'lihat semua' di section kategori & journal." } },
  ],
};
