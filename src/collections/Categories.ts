/**
 * Categories Collection — top-level product categories
 * (Charger & Power, Kabel & Konektor, Holder/Stand/Mount, Audio & Casing)
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "status", "order"],
    group: "Catalog",
  },
  access: {
    read: isPublishedOrAdmin,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "name",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly slug, mis. 'charger-power'. Lowercase, dash-separated.",
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      admin: {
        description: "Deskripsi singkat ditampilkan di header halaman kategori.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: imgHint({
          slot: "Gambar kartu kategori di Beranda & header halaman kategori",
          size: "800×600",
          ratio: "4:3",
          prompt:
            "a tidy flat-lay of phone accessories representing this category on a warm cream surface",
        }),
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Urutan tampilan (lower number first).",
        position: "sidebar",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
    // SEO group
    {
      name: "seo",
      type: "group",
      label: "SEO Override",
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          admin: { description: "Override default meta title (kosongkan untuk auto)." },
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          admin: { description: "Override default meta description (kosongkan untuk auto)." },
        },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Gambar share sosial (Open Graph) kategori ini",
              size: "1200×630",
              ratio: "1.91:1",
              prompt: "a hero banner of this category's phone accessories with brand wordmark space",
            }),
          },
        },
      ],
    },
  ],
};
