/**
 * Media Collection — file uploads (images, dll)
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Storage: local filesystem (staticDir). Auto-generate beberapa ukuran via Sharp.
 *
 * FITUR CROP: crop & focalPoint diaktifkan. Editor bisa:
 *  1. Menggeser "focal point" (titik fokus) — dipakai saat gambar dipotong
 *     otomatis ke tiap aspect ratio (kartu, hero, banner, dll).
 *  2. Meng-crop manual gambar dasar via tombol "Edit Image" di admin.
 *
 * Setiap ukuran di bawah = satu aspect ratio siap-pakai untuk slot berbeda:
 *  - square (1:1)      → foto utama produk, thumbnail kartu
 *  - landscape (4:3)   → kartu kategori, cover journal
 *  - portrait (3:4)    → foto lifestyle / story vertikal
 *  - wide (16:9)       → hero beranda, hero artikel
 *  - banner (21:9)     → banner lebar halaman listing
 *  - og (1.91:1)       → gambar share sosial / Open Graph
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isAuthenticated } from "@/lib/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    group: "Content",
    description:
      "Perpustakaan gambar. Setelah upload, klik 'Edit Image' untuk atur titik fokus/crop. " +
      "Rekomendasi ukuran & prompt ChatGPT tercantum di setiap field gambar (mis. di Produk, Kategori, Hero).",
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
    // Aktifkan tool crop manual + titik fokus untuk auto-crop tiap aspect ratio
    crop: true,
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 400, height: 400, fit: "cover" }, // 1:1 admin/kartu kecil
      { name: "square", width: 800, height: 800, fit: "cover" }, // 1:1 foto utama produk
      { name: "landscape", width: 800, height: 600, fit: "cover" }, // 4:3 kartu kategori/cover journal
      { name: "portrait", width: 900, height: 1200, fit: "cover" }, // 3:4 lifestyle/story vertikal
      { name: "wide", width: 1600, height: 900, fit: "cover" }, // 16:9 hero
      { name: "banner", width: 2100, height: 900, fit: "cover" }, // 21:9 banner listing
      { name: "og", width: 1200, height: 630, fit: "cover" }, // 1.91:1 Open Graph
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
