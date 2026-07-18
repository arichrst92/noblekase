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
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Gambar (desktop)",
      admin: {
        description: imgHint({
          slot: "Banner full-width carousel Beranda (gambar memenuhi layar)",
          size: "1920×800",
          ratio: "2.4:1",
          prompt:
            "a wide full-bleed hero banner of phone accessories, dramatic lighting, generous empty space on one side so headline text stays readable",
        }),
      },
    },
    {
      name: "imageMobile",
      type: "upload",
      relationTo: "media",
      label: "Gambar (mobile, opsional)",
      admin: {
        description: imgHint({
          slot: "Versi mobile banner (opsional; jika kosong, gambar desktop dipotong otomatis)",
          size: "1080×1350",
          ratio: "4:5",
          prompt: "a vertical hero banner of phone accessories with clear space for a headline",
        }),
      },
    },
    {
      type: "collapsible",
      label: "Teks Overlay (opsional)",
      admin: {
        description:
          "Kosongkan semua bila teks sudah menyatu di dalam gambar — carousel akan menampilkan gambar saja.",
      },
      fields: [
        { name: "eyebrow", type: "text", localized: true },
        { name: "headline", type: "text", localized: true },
        { name: "subheadline", type: "textarea", localized: true },
        { name: "ctaLabel", type: "text", localized: true },
        {
          name: "textAlign",
          type: "select",
          defaultValue: "center",
          options: [
            { label: "Kiri", value: "left" },
            { label: "Tengah", value: "center" },
          ],
        },
        {
          name: "textTheme",
          type: "select",
          defaultValue: "light",
          options: [
            { label: "Teks terang (gambar gelap)", value: "light" },
            { label: "Teks gelap (gambar terang)", value: "dark" },
          ],
        },
        {
          name: "scrim",
          type: "checkbox",
          defaultValue: true,
          label: "Gelapkan gambar agar teks terbaca",
        },
      ],
    },
    {
      name: "ctaUrl",
      type: "text",
      defaultValue: "/produk",
      admin: { description: "Tautan slide. Seluruh area banner bisa diklik." },
    },
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
