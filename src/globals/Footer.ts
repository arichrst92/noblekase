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
