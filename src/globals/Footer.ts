/**
 * Footer Global — footer columns
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const Footer: GlobalConfig = {
  slug: "footer",
  admin: {
    group: "System",
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: "tagline",
      type: "text",
      localized: true,
      defaultValue: "Aksesoris yang menemani hari-hari setiap orang.",
    },
    {
      name: "columns",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "title", type: "text", localized: true, required: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", localized: true, required: true },
            { name: "url", type: "text", required: true },
            {
              name: "icon",
              type: "select",
              admin: {
                description:
                  "Ikon di samping label. Kosongkan untuk link biasa (mis. kategori produk). " +
                  "Jika kosong pada link sosial/marketplace, ikon ditebak otomatis dari labelnya.",
              },
              options: [
                { label: "— tanpa ikon —", value: "" },
                { label: "Instagram", value: "instagram" },
                { label: "Facebook", value: "facebook" },
                { label: "TikTok", value: "tiktok" },
                { label: "YouTube", value: "youtube" },
                { label: "X / Twitter", value: "twitter" },
                { label: "WhatsApp", value: "whatsapp" },
                { label: "Marketplace / Toko", value: "store" },
                { label: "Tautan luar", value: "external" },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "copyrightText",
      type: "text",
      defaultValue: "© 2026 Noblekase",
    },
    {
      name: "legalLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", localized: true, required: true },
        { name: "url", type: "text", required: true },
      ],
      defaultValue: [
        { label: "Privacy", url: "/privacy" },
        { label: "Terms", url: "/terms" },
        { label: "Sitemap", url: "/sitemap.xml" },
      ],
    },
  ],
};
