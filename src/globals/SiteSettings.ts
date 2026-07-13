/**
 * SiteSettings — global config (singleton)
 * Brand identity, social links, default SEO, dll.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor, isSuperAdmin } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: {
    group: "System",
  },
  access: {
    read: () => true,
    update: isSuperAdmin,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand",
          fields: [
            {
              name: "siteName",
              type: "text",
              defaultValue: "Noblekase",
              required: true,
            },
            {
              name: "tagline",
              type: "text",
              localized: true,
              defaultValue: "Aksesoris yang menemani hari-hari setiap orang.",
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Logo brand (dipakai di header & footer). Rekomendasi: tinggi 80px, PNG/SVG transparan, " +
                  "wordmark 'Noblekase'. Sebaiknya file brand asli, bukan AI-generated.",
              },
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Favicon (tab browser). Rekomendasi: 512×512px (rasio 1:1), PNG transparan, monogram 'N'.",
              },
            },
          ],
        },
        {
          label: "Contact & Social",
          fields: [
            {
              name: "whatsappNumber",
              type: "text",
              admin: { description: "Nomor WhatsApp dengan kode negara, mis. 628xxx." },
            },
            {
              name: "email",
              type: "email",
              defaultValue: "halo@noblekase.com",
            },
            {
              name: "social",
              type: "array",
              fields: [
                {
                  name: "platform",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Instagram", value: "instagram" },
                    { label: "TikTok", value: "tiktok" },
                    { label: "Facebook", value: "facebook" },
                    { label: "X / Twitter", value: "x" },
                    { label: "YouTube", value: "youtube" },
                  ],
                },
                {
                  name: "handle",
                  type: "text",
                  required: true,
                  admin: { description: "Mis. '@noblekase'." },
                },
                {
                  name: "url",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "SEO Defaults",
          fields: [
            {
              name: "defaultMetaTitle",
              type: "text",
              localized: true,
              admin: { description: "Suffix di belakang setiap title, mis. '· Noblekase'." },
            },
            {
              name: "defaultMetaDescription",
              type: "textarea",
              localized: true,
            },
            {
              name: "defaultOgImage",
              type: "upload",
              relationTo: "media",
              admin: {
                description: imgHint({
                  slot: "Gambar share sosial default (fallback Open Graph seluruh situs)",
                  size: "1200×630",
                  ratio: "1.91:1",
                  prompt:
                    "a branded social share banner with Noblekase phone accessories arranged neatly and space for the wordmark",
                }),
              },
            },
            {
              name: "googleSiteVerification",
              type: "text",
              admin: { description: "Token untuk Search Console verification." },
            },
          ],
        },
        {
          label: "Chatbot",
          fields: [
            {
              name: "chatbotEnabled",
              type: "checkbox",
              defaultValue: true,
            },
            {
              name: "chatbotTitle",
              type: "text",
              localized: true,
              defaultValue: "AI Assistant Noblekase",
              admin: { description: "Judul di header panel chat." },
            },
            {
              name: "chatbotStatusText",
              type: "text",
              localized: true,
              defaultValue: "Online · 24/7",
              admin: { description: "Teks status kecil di header chat." },
            },
            {
              name: "chatbotInputPlaceholder",
              type: "text",
              localized: true,
              defaultValue: "Ketik pertanyaan...",
              admin: { description: "Placeholder kolom input chat." },
            },
            {
              name: "chatbotGreetingId",
              type: "text",
              defaultValue: "Halo! Ada yang bisa saya bantu seputar produk Noblekase?",
            },
            {
              name: "chatbotGreetingEn",
              type: "text",
              defaultValue: "Hi! How can I help you with Noblekase products?",
            },
            {
              name: "chatbotAutoTriggerSeconds",
              type: "number",
              defaultValue: 30,
              admin: { description: "Auto-bounce di Produk Detail setelah X detik. 0 = disabled." },
            },
          ],
        },
        {
          label: "AI Budget",
          fields: [
            {
              name: "aiBudgetCapUsd",
              type: "number",
              defaultValue: 30,
              admin: { description: "Budget cap AI per bulan (USD). Jika tercapai, AI features auto-disable." },
            },
            {
              name: "aiBudgetUsedThisMonth",
              type: "number",
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: "Total biaya AI bulan ini (auto-update).",
              },
            },
          ],
        },
      ],
    },
  ],
};
