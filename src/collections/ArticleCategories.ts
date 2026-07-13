/**
 * ArticleCategories Collection — kategori untuk Journal
 * Seeded: Cerita, Panduan, Edukasi
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";

export const ArticleCategories: CollectionConfig = {
  slug: "article-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "order"],
    group: "Editorial",
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
    },
    {
      name: "description",
      type: "text",
      localized: true,
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
