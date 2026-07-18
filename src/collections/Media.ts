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
import { isAdminOrEditor } from "@/lib/access";
import { BRAND_MOOD } from "@/lib/imageGuidance";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
    group: "Content",
    description:
      "Perpustakaan gambar. Setelah upload, klik 'Edit Image' untuk atur titik fokus/crop. " +
      "Isi field 'Peruntukan' di bawah untuk melihat ukuran yang disarankan, dan " +
      "'Prompt AI' berisi template siap-tempel ke ChatGPT / DALL·E.",
  },
  access: {
    read: () => true, // Public can read media URLs
    // Hanya admin/editor yang boleh upload (sebelumnya semua user login bisa).
    create: isAdminOrEditor,
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
    {
      name: "slot",
      type: "select",
      label: "Peruntukan",
      admin: {
        description:
          "Pilih peruntukan gambar untuk melihat ukuran & rasio yang disarankan. " +
          "Daftar lengkap ada di docs/IMAGE-GUIDE.md.",
      },
      options: [
        { label: "Foto utama produk — 800×800 (1:1)", value: "product-main" },
        { label: "Galeri / detail produk — 800×800 (1:1)", value: "product-gallery" },
        { label: "Lifestyle / cerita produk — 900×1200 (3:4)", value: "lifestyle" },
        { label: "Kartu kategori — 800×600 (4:3)", value: "category" },
        { label: "Hero beranda / halaman — 1600×900 (16:9)", value: "hero" },
        { label: "Cover artikel Journal — 1600×900 (16:9)", value: "article" },
        { label: "Banner listing produk — 2100×900 (21:9)", value: "banner" },
        { label: "Share sosial / Open Graph — 1200×630 (1.91:1)", value: "og" },
        { label: "Logo / ikon brand", value: "brand" },
      ],
    },
    {
      name: "aiPrompt",
      type: "textarea",
      label: "Prompt AI",
      admin: {
        rows: 4,
        description:
          "Template siap-tempel ke ChatGPT / DALL·E. Ganti [SUBJEK] dengan objeknya " +
          '(mis. "a 65W GaN charger on a work desk") dan [RASIO] sesuai Peruntukan di atas. ' +
          "Simpan prompt yang dipakai di sini agar hasilnya bisa diulang/konsisten.\n\n" +
          `"[SUBJEK], ${BRAND_MOOD}. Aspect ratio [RASIO]."`,
      },
    },
  ],
};
