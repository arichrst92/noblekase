/**
 * Articles Collection — Journal blog posts
 * Mendukung AI draft generator (status: ai_draft → review → published)
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "publishedAt"],
    group: "Editorial",
    livePreview: {
      url: ({ data, locale }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL}/${locale.code}/journal/${data?.slug}?preview=true`,
    },
  },
  access: {
    read: isPublishedOrAdmin,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "title",
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
      name: "category",
      type: "relationship",
      relationTo: "article-categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "intro",
      type: "textarea",
      localized: true,
      admin: { description: "Intro/lead paragraph (digunakan di listing dan meta description)." },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: imgHint({
          slot: "Gambar cover & hero artikel (kartu listing + header detail)",
          size: "1600×900",
          ratio: "16:9",
          prompt:
            "an editorial cover image illustrating this article's topic about phone accessories or everyday tech",
        }),
      },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
    },
    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: { description: "Produk yang dibahas di artikel ini." },
    },
    {
      name: "readingTime",
      type: "number",
      admin: {
        description: "Estimasi waktu baca (menit). Auto-hitung jika kosong.",
        position: "sidebar",
      },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "AI Draft (Pending Review)", value: "ai_draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "aiMeta",
      type: "group",
      label: "AI Generation Meta",
      admin: {
        condition: (data) => data?.status === "ai_draft",
      },
      fields: [
        {
          name: "topic",
          type: "text",
          admin: { description: "Topik input ke AI generator." },
        },
        {
          name: "keywords",
          type: "array",
          fields: [{ name: "keyword", type: "text" }],
        },
        {
          name: "model",
          type: "text",
          admin: { description: "Model yang dipakai untuk generate." },
        },
        {
          name: "generatedAt",
          type: "date",
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO Override",
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Gambar share sosial (Open Graph) artikel",
              size: "1200×630",
              ratio: "1.91:1",
              prompt: "a wide social share banner illustrating this article topic with space for a title",
            }),
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" || operation === "update") {
          if (data.status === "published" && !data.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
          // Auto-calculate reading time dari body kalau kosong
          if (!data.readingTime && data.body) {
            const wordsPerMinute = 200;
            const text = JSON.stringify(data.body);
            const wordCount = text.split(/\s+/).length;
            data.readingTime = Math.max(1, Math.round(wordCount / wordsPerMinute));
          }
        }
        return data;
      },
    ],
  },
};
