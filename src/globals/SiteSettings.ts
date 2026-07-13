/**
 * SiteSettings — global config (singleton)
 * Brand identity, social links, default SEO, dll.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor, isSuperAdmin } from "@/lib/access";

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
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
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
