/**
 * Integrations — API key & kredensial third-party, dikelola dari CMS.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * ⚠️ KEAMANAN:
 *  - Akses read & update DIBATASI super-admin saja (tidak pernah publik).
 *  - Nilai di sini MENGGANTIKAN (override) variabel .env dengan nama setara.
 *    Kode membaca CMS dulu, lalu fallback ke .env (lihat src/lib/integrations.ts).
 *  - Beberapa kunci low-level tetap WAJIB di .env (PAYLOAD_SECRET, DATABASE_URI,
 *    REDIS_URL) karena dibutuhkan sebelum database siap dibaca.
 */

import type { GlobalConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Integrations: GlobalConfig = {
  slug: "integrations",
  label: "API Keys & Integrasi",
  admin: {
    group: "System",
    description:
      "Kredensial layanan pihak ketiga. Nilai di sini menggantikan .env. Hanya super-admin yang bisa melihat/mengubah.",
  },
  access: {
    read: isSuperAdmin,
    update: isSuperAdmin,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "AI (Groq)",
          fields: [
            {
              name: "groqApiKey",
              type: "text",
              admin: { description: "API key Groq (console.groq.com/keys). Untuk chatbot & fitur AI. RAHASIA." },
            },
            { name: "groqModelChatbot", type: "text", defaultValue: "llama-3.1-8b-instant" },
            { name: "groqModelBlog", type: "text", defaultValue: "llama-3.3-70b-versatile" },
            { name: "groqModelMarketIntel", type: "text", defaultValue: "llama-3.3-70b-versatile" },
          ],
        },
        {
          label: "Email (Resend)",
          fields: [
            {
              name: "resendApiKey",
              type: "text",
              admin: { description: "API key Resend (resend.com/api-keys) untuk email transaksional. RAHASIA." },
            },
            { name: "emailFrom", type: "email", defaultValue: "noreply@noblekase.co.id" },
            { name: "emailReplyTo", type: "email", defaultValue: "halo@noblekase.co.id" },
          ],
        },
        {
          label: "Google & Analytics",
          fields: [
            {
              name: "gaMeasurementId",
              type: "text",
              admin: { description: "Google Analytics 4 Measurement ID, mis. G-XXXXXXXXXX. Bukan rahasia (tampil di frontend)." },
            },
            {
              name: "searchConsoleProperty",
              type: "text",
              admin: { description: "URL properti Search Console, mis. https://noblekase.co.id/" },
            },
            {
              name: "indexingServiceAccountJson",
              type: "textarea",
              admin: {
                description: "Isi JSON service account Google Indexing API (paste seluruh file). RAHASIA.",
                rows: 6,
              },
            },
          ],
        },
      ],
    },
  ],
};
