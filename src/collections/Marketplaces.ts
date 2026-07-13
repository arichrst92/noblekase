/**
 * Marketplaces Collection — daftar marketplace channel
 * Seeded: Tokopedia, Shopee, TikTok Shop, Lazada
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";

export const Marketplaces: CollectionConfig = {
  slug: "marketplaces",
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
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Identifier unik, mis. 'tokopedia', 'shopee'.",
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Logo marketplace (SVG/PNG, ~32x32px).",
      },
    },
    {
      name: "color",
      type: "text",
      admin: {
        description: "Warna brand marketplace (hex), untuk badge/aksen. Mis. #00AA5B (Tokopedia).",
      },
    },
    {
      name: "baseUrl",
      type: "text",
      admin: {
        description: "Base URL marketplace, mis. https://tokopedia.com/noblekaseid",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      options: [
        { label: "Active", value: "published" },
        { label: "Inactive", value: "draft" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
