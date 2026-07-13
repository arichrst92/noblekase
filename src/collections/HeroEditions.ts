/**
 * HeroEditions — hero content per "edisi" untuk Beranda
 * Bisa scheduled (valid_from / valid_to) untuk auto-rotate sesuai bulan/musim.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isAuthenticated } from "@/lib/access";

export const HeroEditions: CollectionConfig = {
  slug: "hero-editions",
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "isActive", "validFrom", "validTo"],
    group: "Content",
  },
  access: {
    read: () => true, // Frontend perlu fetch ini
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "Mis. 'Edisi Mei 2026', 'Lebaran 2026'." },
    },
    {
      name: "eyebrow",
      type: "text",
      localized: true,
      defaultValue: "EDISI · MEI 2026",
    },
    {
      name: "headline",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "subheadline",
      type: "textarea",
      localized: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "ctaLabel",
      type: "text",
      localized: true,
      defaultValue: "Jelajahi produk →",
    },
    {
      name: "ctaUrl",
      type: "text",
      defaultValue: "/produk",
    },
    {
      name: "validFrom",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "validTo",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Hanya 1 edisi yang boleh active dalam satu waktu.",
      },
    },
  ],
};
