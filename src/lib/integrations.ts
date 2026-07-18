/**
 * integrations.ts — resolusi kredensial third-party: CMS dulu, lalu fallback .env.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY. Jangan import dari komponen client — berisi nilai rahasia.
 *
 * Dipakai oleh fitur runtime (chatbot AI, email, Google Indexing) yang dibangun
 * di sprint berikutnya. Client cukup mengisi key di CMS → tidak perlu ubah .env.
 */

import { getIntegrations } from "@/lib/queries";

export interface ResolvedIntegrations {
  groqApiKey?: string;
  groqModelChatbot: string;
  groqModelBlog: string;
  groqModelMarketIntel: string;
  resendApiKey?: string;
  emailFrom: string;
  emailReplyTo: string;
  gaMeasurementId?: string;
  searchConsoleProperty?: string;
  indexingServiceAccountJson?: string;
}

/** Ambil nilai dari CMS, fallback ke env. String kosong dianggap tidak diisi. */
function pick(cmsVal: unknown, envVal: string | undefined): string | undefined {
  const v = typeof cmsVal === "string" && cmsVal.trim() ? cmsVal.trim() : undefined;
  return v ?? (envVal && envVal.trim() ? envVal.trim() : undefined);
}

export async function resolveIntegrations(): Promise<ResolvedIntegrations> {
  const g = (await getIntegrations()) ?? {};
  return {
    groqApiKey: pick(g.groqApiKey, process.env.GROQ_API_KEY),
    groqModelChatbot: pick(g.groqModelChatbot, process.env.GROQ_MODEL_CHATBOT) ?? "llama-3.1-8b-instant",
    groqModelBlog: pick(g.groqModelBlog, process.env.GROQ_MODEL_BLOG) ?? "llama-3.3-70b-versatile",
    groqModelMarketIntel:
      pick(g.groqModelMarketIntel, process.env.GROQ_MODEL_MARKET_INTEL) ?? "llama-3.3-70b-versatile",
    resendApiKey: pick(g.resendApiKey, process.env.RESEND_API_KEY),
    emailFrom: pick(g.emailFrom, process.env.EMAIL_FROM) ?? "noreply@noblekase.co.id",
    emailReplyTo: pick(g.emailReplyTo, process.env.EMAIL_REPLY_TO) ?? "halo@noblekase.co.id",
    gaMeasurementId: pick(g.gaMeasurementId, process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    searchConsoleProperty: pick(g.searchConsoleProperty, process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY),
    indexingServiceAccountJson: pick(g.indexingServiceAccountJson, undefined),
  };
}
