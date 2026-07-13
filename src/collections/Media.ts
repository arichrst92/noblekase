/**
 * Media Collection — file uploads (images, dll)
 *
 * Auto-generates multiple sizes via Sharp.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isAuthenticated } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    group: "Content",
  },
  access: {
    read: () => true, // Public can read media URLs
    create: isAuthenticated,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: {
    staticDir: process.env.UPLOAD_DIR || "uploads",
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
    imageSizes: [
      { name: "thumbnail", width: 320, height: 320, fit: "cover" },
      { name: "card", width: 640, height: 640, fit: "cover" },
      { name: "featured", width: 1280, height: 960, fit: "cover" },
      { name: "hero", width: 1920, height: 1080, fit: "cover" },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 85 },
    },
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
      admin: {
        description: "Deskripsi gambar untuk accessibility & SEO. Wajib diisi.",
      },
    },
    {
      name: "caption",
      type: "text",
      localized: true,
      admin: {
        description: "Caption opsional untuk ditampilkan di bawah gambar.",
      },
    },
  ],
};
