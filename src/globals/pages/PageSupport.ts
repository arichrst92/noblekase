/**
 * PageSupport — konten halaman Dukungan: hero, kanal kontak, jam operasional,
 * dan heading section FAQ. (Isi FAQ ada di koleksi FAQItems / FAQCategories.)
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";
import { imgHint } from "@/lib/imageGuidance";

export const PageSupport: GlobalConfig = {
  slug: "page-support",
  label: "Dukungan (Konten)",
  admin: { group: "Halaman (Konten)" },
  access: { read: () => true, update: isAdminOrEditor },
  fields: [
    {
      type: "collapsible",
      label: "Hero",
      fields: [
        { name: "heroEyebrow", type: "text", localized: true, defaultValue: "Dukungan" },
        { name: "heroHeadline", type: "text", localized: true, defaultValue: "Bantu kami menjawab Anda" },
        {
          name: "heroIntro",
          type: "textarea",
          localized: true,
          defaultValue:
            "Tim kecil yang membaca semua pesan. Cara tercepat lewat WhatsApp di jam kerja, atau DM Instagram kapan saja.",
        },
        {
          name: "heroImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: imgHint({
              slot: "Gambar hero halaman Dukungan",
              size: "1600×900",
              ratio: "16:9",
              prompt: "a friendly warm scene suggesting customer care and communication, phone on a cafe table",
            }),
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Kanal Kontak",
      fields: [
        { name: "channelsEyebrow", type: "text", localized: true, defaultValue: "Kanal" },
        { name: "channelsHeadline", type: "text", localized: true, defaultValue: "Pilih cara yang paling nyaman" },
        {
          name: "channels",
          type: "array",
          labels: { singular: "Kanal", plural: "Kanal" },
          fields: [
            { name: "icon", type: "text", admin: { description: "Lucide icon name, mis. 'message-circle', 'instagram', 'mail'." } },
            { name: "title", type: "text", localized: true, required: true },
            { name: "description", type: "text", localized: true },
            { name: "buttonLabel", type: "text", localized: true },
            { name: "url", type: "text" },
          ],
          defaultValue: [
            { icon: "message-circle", title: "WhatsApp", description: "Respons paling cepat (~15 menit jam kerja)", buttonLabel: "Chat WhatsApp", url: "" },
            { icon: "instagram", title: "Instagram", description: "@noblekase — DM kami untuk pertanyaan & feedback", buttonLabel: "Buka Instagram", url: "" },
            { icon: "music", title: "TikTok", description: "@noblekase — video, behind the scenes", buttonLabel: "Buka TikTok", url: "" },
            { icon: "mail", title: "Email", description: "halo@noblekase.com — untuk kerjasama & B2B", buttonLabel: "Kirim Email", url: "" },
          ],
        },
        {
          name: "operatingHours",
          type: "text",
          localized: true,
          defaultValue: "Jam operasional: Senin–Jumat 09.00–17.00 WIB · Sabtu 10.00–14.00",
        },
      ],
    },
    {
      type: "collapsible",
      label: "FAQ",
      fields: [
        { name: "faqEyebrow", type: "text", localized: true, defaultValue: "FAQ" },
        { name: "faqHeadline", type: "text", localized: true, defaultValue: "Pertanyaan yang sering ditanyakan" },
      ],
    },
  ],
};
