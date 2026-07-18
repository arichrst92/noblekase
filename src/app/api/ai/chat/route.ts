/**
 * /api/ai/chat — chatbot Noblekase (Groq + RAG dari katalog CMS).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Penjaga berlapis sebelum memanggil model:
 *   1. Feature flag chatbot (Site Settings)
 *   2. API key Groq tersedia (Integrasi CMS → fallback .env)
 *   3. Rate limit per IP
 *   4. Batas anggaran bulanan (aiBudgetCapUsd)
 *
 * Balasan di-stream sebagai text/plain agar UI bisa menampilkannya
 * bertahap tanpa library tambahan.
 */

import Groq from "groq-sdk";
import { getPayloadClient } from "@/lib/payload";
import { getSiteSettings } from "@/lib/queries";
import { resolveIntegrations } from "@/lib/integrations";
import { retrieveContext } from "@/lib/ai/retrieve";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";
import { defaultLocale, isLocale, localePath, type Locale } from "@/lib/i18n";

export const maxDuration = 30;

/** Perkiraan harga Groq llama-3.1-8b-instant (USD per 1 juta token). */
const PRICE_IN_PER_M = 0.05;
const PRICE_OUT_PER_M = 0.08;

const RATE_LIMIT = Number(process.env.RATE_LIMIT_AI_CHAT ?? 20);

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Pesan penjaga (rate limit, fitur mati, kuota habis) ikut dua bahasa.
 * Tidak lewat kamus UI di src/lib/i18n.ts karena beberapa di antaranya
 * menyisipkan angka detik dan hanya dipakai di endpoint ini.
 */
const GUARD: Record<Locale, Record<string, string>> = {
  id: {
    rateLimited: "Maaf, terlalu banyak permintaan. Coba lagi dalam {seconds} detik ya.",
    invalid: "Permintaan tidak valid.",
    emptyQuestion: "Silakan tulis pertanyaan Anda.",
    disabled: "Asisten sedang dinonaktifkan. Silakan hubungi kami lewat halaman Dukungan.",
    notConfigured:
      "Asisten belum dikonfigurasi. Silakan hubungi kami lewat halaman Dukungan ({support}).",
    budgetSpent:
      "Kuota asisten bulan ini sudah habis. Silakan hubungi kami lewat halaman Dukungan ({support}).",
  },
  en: {
    rateLimited: "Too many requests. Please try again in {seconds} seconds.",
    invalid: "Invalid request.",
    emptyQuestion: "Please type your question.",
    disabled: "The assistant is currently disabled. Please reach us through the Support page.",
    notConfigured:
      "The assistant is not configured yet. Please reach us through the Support page ({support}).",
    budgetSpent:
      "This month's assistant quota has run out. Please reach us through the Support page ({support}).",
  },
};

function guard(locale: Locale, key: string, vars: Record<string, string | number> = {}) {
  const template = GUARD[locale][key] ?? GUARD[defaultLocale][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (m, name: string) =>
    name in vars ? String(vars[name]) : m,
  );
}

function plain(text: string, status = 200) {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function systemPrompt(siteName: string, context: string, locale: Locale) {
  const supportPath = localePath(locale, "/dukungan");
  const detailPath = localePath(locale, "/produk/detail/slug");
  const language =
    locale === "en"
      ? "Answer in English."
      : "Jawab dalam Bahasa Indonesia.";

  return [
    `Kamu adalah asisten belanja ${siteName}, brand aksesoris HP asal Indonesia.`,
    "",
    "ATURAN PENTING:",
    `- Jawab HANYA berdasarkan DATA KATALOG di bawah. Jangan mengarang produk, spesifikasi, atau harga.`,
    `- Bila informasi tidak ada di data, katakan terus terang dan arahkan ke halaman Dukungan (${supportPath}) atau WhatsApp.`,
    `- ${siteName} TIDAK menjual langsung di website. Pembelian lewat marketplace (Tokopedia, Shopee, TikTok Shop, Lazada).`,
    "- Kamu TIDAK tahu harga. Bila ditanya harga, jelaskan bahwa harga ada di masing-masing marketplace dan arahkan ke halaman produknya.",
    `- Jawab ringkas (maksimal 3-4 kalimat) dan ramah. ${language}`,
    `- Bila menyebut produk, sertakan tautannya seperti ${detailPath}.`,
    "",
    "DATA KATALOG:",
    context,
  ].join("\n");
}

export async function POST(request: Request) {
  let messages: ChatMessage[] = [];
  let locale: Locale = defaultLocale;
  try {
    const body = (await request.json()) as { messages?: ChatMessage[]; locale?: string };
    messages = (body.messages ?? []).slice(-8); // batasi riwayat
    if (isLocale(body.locale)) locale = body.locale;
  } catch {
    return plain(guard(defaultLocale, "invalid"), 400);
  }

  const supportPath = localePath(locale, "/dukungan");

  // 1. Rate limit
  const rl = await rateLimit(clientKey(request, "ai-chat"), RATE_LIMIT);
  if (!rl.allowed) {
    return plain(guard(locale, "rateLimited", { seconds: rl.retryAfterSeconds }), 429);
  }

  const question = [...messages].reverse().find((m) => m.role === "user")?.content?.trim();
  if (!question) return plain(guard(locale, "emptyQuestion"), 400);

  // 2. Feature flag + 3. API key + 4. anggaran
  const [settings, integrations] = await Promise.all([
    getSiteSettings(locale),
    resolveIntegrations(),
  ]);

  if (settings?.chatbotEnabled === false) {
    return plain(guard(locale, "disabled"), 503);
  }
  if (!integrations.groqApiKey) {
    return plain(guard(locale, "notConfigured", { support: supportPath }), 503);
  }

  const cap = Number(settings?.aiBudgetCapUsd ?? 0);
  const used = Number(settings?.aiBudgetUsedThisMonth ?? 0);
  if (cap > 0 && used >= cap) {
    return plain(guard(locale, "budgetSpent", { support: supportPath }), 503);
  }

  // RAG: ambil konteks katalog yang relevan
  const { context } = await retrieveContext(question, locale);
  const siteName = settings?.siteName ?? "Noblekase";

  const groq = new Groq({ apiKey: integrations.groqApiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: integrations.groqModelChatbot,
      temperature: 0.3,
      max_tokens: 500,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt(siteName, context, locale) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const encoder = new TextEncoder();
    let outputChars = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              outputChars += delta.length;
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch {
          controller.enqueue(encoder.encode("\n\n(Maaf, koneksi ke asisten terputus.)"));
        } finally {
          controller.close();
          // Catat perkiraan biaya (≈4 karakter per token).
          void recordUsage(context.length + question.length, outputChars, used);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return plain("Maaf, asisten sedang tidak dapat dihubungi. Coba lagi sebentar lagi.", 502);
  }
}

/** Tambahkan perkiraan biaya ke Site Settings (gagal-aman). */
async function recordUsage(inputChars: number, outputChars: number, previousUsed: number) {
  try {
    const inTokens = inputChars / 4;
    const outTokens = outputChars / 4;
    const cost =
      (inTokens / 1_000_000) * PRICE_IN_PER_M + (outTokens / 1_000_000) * PRICE_OUT_PER_M;
    const payload = await getPayloadClient();
    await payload.updateGlobal({
      slug: "site-settings" as never,
      data: { aiBudgetUsedThisMonth: Number((previousUsed + cost).toFixed(6)) } as never,
    });
  } catch {
    /* pencatatan biaya tidak boleh mengganggu jawaban */
  }
}
