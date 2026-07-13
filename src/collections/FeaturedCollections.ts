/**
 * FeaturedCollections — kurasi produk untuk section "Cerita Edisi Ini" di Beranda
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const FeaturedCollections: CollectionConfig = {
  slug: "featured-collections",
  admin: {
    useAsTitle: "headline",
    defaultColumns: ["headline", "isActive"],
    group: "Content",
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "eyebrow",
      type: "text",
      localized: true,
      defaultValue: "CERITA EDISI INI",
    },
    {
      name: "headline",
      type: "text",
      localized: true,
      required: true,
      admin: { description: "Mis. 'Untuk Pekerja Mobile', 'Setup Meja Minimalis'." },
    },
    {
      name: "subheadline",
      type: "text",
      localized: true,
    },
    {
      name: "mainProduct",
      type: "relationship",
      relationTo: "products",
      required: true,
      admin: { description: "Produk utama (ditampilkan besar)." },
    },
    {
      name: "secondaryProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      maxRows: 2,
      admin: { description: "2 produk pendukung (ditampilkan kecil)." },
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
        description: "Hanya 1 collection active dalam satu waktu.",
      },
    },
  ],
};
