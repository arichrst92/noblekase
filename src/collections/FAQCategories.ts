/**
 * FAQCategories Collection — kategori FAQ
 * Seeded: Produk, Garansi, Pembelian, Pengiriman
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const FAQCategories: CollectionConfig = {
  slug: "faq-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"],
    group: "Editorial",
  },
  access: {
    read: () => true,
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
    },
    {
      name: "icon",
      type: "text",
      admin: { description: "Lucide icon name." },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
