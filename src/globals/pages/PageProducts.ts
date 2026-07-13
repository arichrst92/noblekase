/**
 * PageProducts — header, banner, & label halaman listing Produk + filter sidebar.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const PageProducts: GlobalConfig = {
  slug: "page-products",
  label: "Produk — Listing (Konten)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    { name: "eyebrow", type: "text", localized: true, defaultValue: "Koleksi" },
    { name: "headline", type: "text", localized: true, defaultValue: "Semua produk Noblekase" },
    {
      name: "intro",
      type: "textarea",
      localized: true,
      defaultValue:
        "Empat kategori yang menemani hari-hari Anda. Harga ada di marketplace pilihan — kami menjaga koleksi & konsistensi kualitas.",
    },
    {
      name: "bannerImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: imgHint({
          slot: "Banner lebar di atas halaman listing produk",
          size: "2100×900",
          ratio: "21:9",
          prompt: "a wide editorial banner showing an assortment of phone accessories laid out neatly on a warm surface",
        }),
      },
    },
    {
      name: "countTemplate",
      type: "text",
      localized: true,
      defaultValue: "Menampilkan {count} produk",
      admin: { description: "Gunakan {count} sebagai placeholder jumlah produk." },
    },
    { name: "sortLabel", type: "text", localized: true, defaultValue: "Urutkan: Default" },
    { name: "seeAllLabel", type: "text", localized: true, defaultValue: "Lihat semua →" },
    {
      type: "collapsible",
      label: "Filter Sidebar",
      fields: [
        { name: "filterCategoryTitle", type: "text", localized: true, defaultValue: "Kategori" },
        { name: "filterAllLabel", type: "text", localized: true, defaultValue: "Semua produk" },
        { name: "filterMarketplaceTitle", type: "text", localized: true, defaultValue: "Marketplace" },
        {
          name: "filterDisclaimer",
          type: "textarea",
          localized: true,
          defaultValue:
            "Harga ditampilkan di setiap marketplace. Kami menyatukan koleksi — marketplace yang memutuskan promo & ongkos kirim.",
        },
      ],
    },
  ],
};
