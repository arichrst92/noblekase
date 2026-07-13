/**
 * Pages Collection — halaman statis (Tentang, Kontak, Dukungan)
 * Block-based content untuk fleksibilitas.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor, isPublishedOrAdmin } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status"],
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
      name: "blocks",
      type: "blocks",
      blocks: [
        {
          slug: "hero",
          labels: { singular: "Hero Section", plural: "Hero Sections" },
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "headline", type: "text", localized: true, required: true },
            { name: "subheadline", type: "textarea", localized: true },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              admin: {
                description: imgHint({
                  slot: "Gambar hero halaman (mis. Tentang)",
                  size: "1600×900",
                  ratio: "16:9",
                  prompt: "an editorial brand scene fitting this page's theme, warm and inviting with space for a headline",
                }),
              },
            },
            { name: "alignment", type: "select", defaultValue: "center", options: ["left", "center"] },
          ],
        },
        {
          slug: "pillars",
          labels: { singular: "Pillars Section", plural: "Pillars Sections" },
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "headline", type: "text", localized: true },
            {
              name: "items",
              type: "array",
              minRows: 2,
              maxRows: 4,
              fields: [
                { name: "icon", type: "text" },
                { name: "title", type: "text", localized: true, required: true },
                { name: "description", type: "textarea", localized: true },
              ],
            },
          ],
        },
        {
          slug: "story",
          labels: { singular: "Story Section", plural: "Story Sections" },
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "headline", type: "text", localized: true },
            { name: "body", type: "richText", localized: true },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              admin: {
                description: imgHint({
                  slot: "Gambar pendamping section cerita",
                  size: "900×1200",
                  ratio: "3:4",
                  prompt: "a warm editorial photo supporting this story section, natural light, lived-in",
                }),
              },
            },
            { name: "imagePosition", type: "select", defaultValue: "left", options: ["left", "right"] },
          ],
        },
        {
          slug: "numberedList",
          labels: { singular: "Numbered List", plural: "Numbered Lists" },
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "headline", type: "text", localized: true },
            {
              name: "items",
              type: "array",
              fields: [
                { name: "title", type: "text", localized: true, required: true },
                { name: "description", type: "textarea", localized: true },
              ],
            },
          ],
        },
        {
          slug: "cta",
          labels: { singular: "CTA Section", plural: "CTA Sections" },
          fields: [
            { name: "headline", type: "text", localized: true, required: true },
            { name: "buttonLabel", type: "text", localized: true, required: true },
            { name: "buttonUrl", type: "text", required: true },
          ],
        },
      ],
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
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Gambar share sosial (Open Graph) halaman ini",
              size: "1200×630",
              ratio: "1.91:1",
              prompt: "a wide social share banner representing this page with room for a title",
            }),
          },
        },
      ],
    },
  ],
};
