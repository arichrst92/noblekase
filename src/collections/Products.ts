/**
 * Products Collection — produk Noblekase
 * Tabel utama dengan media, features, marketplace links, story, specs.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "subCategory", "badge", "status", "updatedAt"],
    group: "Catalog",
    livePreview: {
      url: ({ data, locale }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL}/${locale.code}/produk/${data?.slug}?preview=true`,
    },
  },
  access: {
    read: isPublishedOrAdmin,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    // === MAIN INFO ===
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
      admin: {
        description: "URL-friendly slug, mis. 'gan-65w-dual-usbc'.",
      },
    },
    {
      name: "sku",
      type: "text",
      unique: true,
      admin: {
        description: "Internal SKU untuk inventory tracking.",
      },
    },
    {
      name: "subCategory",
      type: "relationship",
      relationTo: "sub-categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "tagline",
      type: "textarea",
      localized: true,
      admin: {
        description: "Tagline singkat, ditampilkan di kartu produk dan detail (1-2 baris).",
      },
    },
    {
      name: "badge",
      type: "select",
      options: [
        { label: "—", value: "" },
        { label: "NEW", value: "new" },
        { label: "BEST SELLER", value: "best-seller" },
        { label: "LIMITED", value: "limited" },
      ],
      admin: { position: "sidebar" },
    },

    // === TABS ===
    {
      type: "tabs",
      tabs: [
        // === STORY ===
        {
          label: "Cerita Produk",
          fields: [
            {
              name: "storyEyebrow",
              type: "text",
              localized: true,
              defaultValue: "CERITA PRODUK",
              admin: { description: "Eyebrow text di section story." },
            },
            {
              name: "storyHeadline",
              type: "text",
              localized: true,
              admin: { description: "Headline narrative produk." },
            },
            {
              name: "storyBody",
              type: "richText",
              localized: true,
            },
            {
              name: "storyImage",
              type: "upload",
              relationTo: "media",
              admin: {
                description: imgHint({
                  slot: "Foto lifestyle untuk section cerita produk",
                  size: "900×1200",
                  ratio: "3:4",
                  prompt:
                    "this phone accessory in a real everyday context (desk, cafe, travel bag), lived-in and natural",
                }),
              },
            },
          ],
        },

        // === GALLERY ===
        {
          label: "Gallery",
          fields: [
            {
              name: "mainImage",
              type: "upload",
              relationTo: "media",
              required: true,
              admin: {
                description: imgHint({
                  slot: "Foto utama produk (kartu & galeri detail, tampil pertama)",
                  size: "800×800",
                  ratio: "1:1",
                  prompt:
                    "a clean product photo of this phone accessory centered on a warm cream background, soft shadow",
                }),
              },
            },
            {
              name: "gallery",
              type: "array",
              labels: { singular: "Foto", plural: "Foto-foto" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  admin: {
                    description: imgHint({
                      slot: "Foto galeri produk (gallery 1:1, lifestyle 3:4, atau detail close-up)",
                      size: "800×800 (gallery) / 900×1200 (lifestyle)",
                      ratio: "1:1 atau 3:4",
                      prompt:
                        "an additional angle or detail close-up of this phone accessory, consistent lighting with the main photo",
                    }),
                  },
                },
                {
                  name: "type",
                  type: "select",
                  defaultValue: "gallery",
                  options: [
                    { label: "Gallery (thumbnail)", value: "gallery" },
                    { label: "Lifestyle", value: "lifestyle" },
                    { label: "Detail/Close-up", value: "detail" },
                  ],
                },
              ],
            },
          ],
        },

        // === FEATURES ===
        {
          label: "Fitur Utama",
          fields: [
            {
              name: "features",
              type: "array",
              labels: { singular: "Fitur", plural: "Fitur Utama" },
              minRows: 0,
              maxRows: 6,
              fields: [
                {
                  name: "icon",
                  type: "text",
                  admin: { description: "Lucide icon name, mis. 'zap', 'cable', 'thermometer'." },
                },
                {
                  name: "title",
                  type: "text",
                  localized: true,
                  required: true,
                },
                {
                  name: "description",
                  type: "text",
                  localized: true,
                },
              ],
            },
          ],
        },

        // === SPECS ===
        {
          label: "Spesifikasi",
          fields: [
            {
              name: "specs",
              type: "array",
              labels: { singular: "Spec Item", plural: "Spesifikasi" },
              fields: [
                {
                  name: "label",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { description: "Mis. 'Daya total', 'Port', 'Dimensi'." },
                },
                {
                  name: "value",
                  type: "text",
                  localized: true,
                  required: true,
                  admin: { description: "Mis. '65W max', '2× USB-C PD', '52×47×30 mm'." },
                },
              ],
            },
            {
              name: "inBox",
              type: "textarea",
              localized: true,
              admin: { description: "Daftar isi paket. Mis. '1× charger · 1× cable · 1× manual'." },
            },
            {
              name: "warranty",
              type: "textarea",
              localized: true,
              admin: { description: "Info garansi. Mis. '12 bulan garansi resmi'." },
            },
          ],
        },

        // === MARKETPLACES ===
        {
          label: "Marketplace Links",
          fields: [
            {
              name: "marketplaceLinks",
              type: "array",
              labels: { singular: "Link", plural: "Marketplace Links" },
              fields: [
                {
                  name: "marketplace",
                  type: "relationship",
                  relationTo: "marketplaces",
                  required: true,
                },
                {
                  name: "url",
                  type: "text",
                  required: true,
                  admin: { description: "Full URL ke produk di marketplace." },
                },
                {
                  name: "statusLabel",
                  type: "text",
                  admin: { description: "Mis. 'Toko Resmi', 'Mall', 'LazMall'." },
                },
                {
                  name: "benefitLabel",
                  type: "text",
                  admin: { description: "Mis. 'Free Ongkir', 'Cashback 5%', 'Live Promo'." },
                },
                {
                  name: "isPrimary",
                  type: "checkbox",
                  defaultValue: false,
                  admin: { description: "Tandai marketplace utama (CTA primary)." },
                },
              ],
            },
            {
              name: "whatsappEnquiry",
              type: "text",
              admin: { description: "URL WhatsApp untuk konsultasi. Mis. https://wa.me/628xxx?text=Tanya%20tentang%20{product}" },
            },
          ],
        },

        // === SEO ===
        {
          label: "SEO Override",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                {
                  name: "title",
                  type: "text",
                  localized: true,
                  admin: { description: "Override meta title (kosongkan untuk auto)." },
                },
                {
                  name: "description",
                  type: "textarea",
                  localized: true,
                  admin: { description: "Override meta description (kosongkan untuk auto)." },
                },
                {
                  name: "ogImage",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: imgHint({
                      slot: "Gambar share sosial (Open Graph) produk ini",
                      size: "1200×630",
                      ratio: "1.91:1",
                      prompt: "this phone accessory as a wide social share banner with room for text",
                    }),
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // === SIDEBAR ===
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      maxRows: 6,
      admin: {
        position: "sidebar",
        description: "Produk terkait di halaman detail. Kosongkan = otomatis ambil dari kategori yang sama.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Urutan tampilan di listing." },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" || operation === "update") {
          if (data.status === "published" && !data.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
        }
        return data;
      },
    ],
    afterChange: [
      // TODO: trigger Google Indexing API submission saat published
      // TODO: invalidate Next.js cache untuk halaman produk
    ],
  },
};
