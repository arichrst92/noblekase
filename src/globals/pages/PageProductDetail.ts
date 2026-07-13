/**
 * PageProductDetail — label & eyebrow section di halaman detail produk.
 * (Konten produk itu sendiri ada di koleksi Products.)
 * Template pakai {product} untuk nama produk.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const PageProductDetail: GlobalConfig = {
  slug: "page-product-detail",
  label: "Produk — Detail (Label)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    {
      type: "collapsible",
      label: "Breadcrumb",
      fields: [
        { name: "breadcrumbHome", type: "text", localized: true, defaultValue: "Beranda" },
        { name: "breadcrumbProducts", type: "text", localized: true, defaultValue: "Produk" },
      ],
    },
    {
      type: "collapsible",
      label: "Section Marketplace",
      fields: [
        { name: "marketplaceSectionLabel", type: "text", localized: true, defaultValue: "Beli di marketplace pilihan" },
        { name: "badgeBestPrice", type: "text", localized: true, defaultValue: "Harga terbaik" },
        { name: "badgeFastShip", type: "text", localized: true, defaultValue: "Pengiriman cepat" },
        { name: "badgeNew", type: "text", localized: true, defaultValue: "Baru rilis" },
        { name: "whatsappCtaLabel", type: "text", localized: true, defaultValue: "Tanya via WhatsApp →" },
      ],
    },
    {
      type: "collapsible",
      label: "Label Section Lain",
      fields: [
        { name: "storyLabel", type: "text", localized: true, defaultValue: "Cerita Produk" },
        { name: "specsLabel", type: "text", localized: true, defaultValue: "Spesifikasi" },
        { name: "lifestyleEyebrow", type: "text", localized: true, defaultValue: "Dalam Keseharian" },
        {
          name: "lifestyleHeadingSuffix",
          type: "text",
          localized: true,
          defaultValue: " di hari-hari biasa",
          admin: { description: "Ditambahkan setelah nama produk, mis. 'Pulse 30W di hari-hari biasa'." },
        },
        { name: "relatedEyebrow", type: "text", localized: true, defaultValue: "Mungkin juga cocok" },
        { name: "relatedHeadline", type: "text", localized: true, defaultValue: "Produk lain yang sering dipasangkan" },
        {
          name: "stickyCtaTemplate",
          type: "text",
          localized: true,
          defaultValue: "Beli {product}",
          admin: { description: "Tombol sticky. Gunakan {product} untuk nama produk." },
        },
      ],
    },
  ],
};
