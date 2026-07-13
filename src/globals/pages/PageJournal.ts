/**
 * PageJournal — header & label halaman listing Journal.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const PageJournal: GlobalConfig = {
  slug: "page-journal",
  label: "Journal — Listing (Konten)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    { name: "eyebrow", type: "text", localized: true, defaultValue: "Journal" },
    { name: "headline", type: "text", localized: true, defaultValue: "Cerita & panduan dari Noblekase" },
    {
      name: "intro",
      type: "textarea",
      localized: true,
      defaultValue:
        "Mengupas pelan-pelan: cara memilih charger yang pas, alasan kami memilih kertas FSC, dan cerita di balik setiap edisi.",
    },
    { name: "highlightLabel", type: "text", localized: true, defaultValue: "Sorotan" },
    { name: "readMoreLabel", type: "text", localized: true, defaultValue: "Baca selengkapnya →" },
    { name: "allArticlesEyebrow", type: "text", localized: true, defaultValue: "Semua Artikel" },
    {
      name: "countTemplate",
      type: "text",
      localized: true,
      defaultValue: "{count} cerita",
      admin: { description: "Gunakan {count} sebagai placeholder jumlah artikel." },
    },
  ],
};
