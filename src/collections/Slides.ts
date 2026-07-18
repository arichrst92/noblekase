/**
 * Slides Collection — slide untuk carousel di Beranda.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Tambah entri baru = tambah slide. Urutan diatur lewat field `order`.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const Slides: CollectionConfig = {
  slug: "slides",
  labels: { singular: "Slide", plural: "Slides" },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "order", "status"],
    group: "Content",
    description: "Slide carousel Beranda. Urutkan lewat kolom 'order' (kecil tampil dulu).",
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "Nama internal slide, mis. 'Promo Charger Mei'." },
    },
    { name: "eyebrow", type: "text", localized: true },
    { name: "headline", type: "text", localized: true, required: true },
    { name: "subheadline", type: "textarea", localized: true },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: imgHint({
          slot: "Gambar slide carousel Beranda",
          size: "1600×900",
          ratio: "16:9",
          prompt:
            "a wide promotional banner of phone accessories arranged neatly, leaving clear space on one side for headline text",
        }),
      },
    },
    { name: "ctaLabel", type: "text", localized: true, defaultValue: "Lihat produk" },
    { name: "ctaUrl", type: "text", defaultValue: "/produk" },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Urutan tampil (kecil dulu)." },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
