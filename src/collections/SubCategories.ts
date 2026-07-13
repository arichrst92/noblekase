/**
 * SubCategories Collection — produk sub-kategori
 * Mis. Wall Charger, Car Charger, Wireless Charger, Power Bank di bawah Charger & Power.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";

export const SubCategories: CollectionConfig = {
  slug: "sub-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "slug", "order"],
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
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar" },
    },
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
      index: true,
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "filterConfig",
      type: "textarea",
      admin: {
        description:
          "Konfigurasi filter (format JSON) untuk sub-kategori ini. Contoh: {\"daya\": [\"20W\",\"65W\",\"100W\"], \"fitur\": [\"GaN\",\"Multi-port\"]}. Disimpan sebagai teks; di-parse saat filter dinamis dibangun (Sprint 3).",
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
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
