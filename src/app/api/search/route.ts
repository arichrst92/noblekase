/**
 * /api/search — endpoint JSON ringan untuk saran pencarian di header.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Halaman hasil lengkap ada di /cari. Endpoint ini hanya mengembalikan
 * beberapa item teratas agar dropdown tetap ringan.
 */

import { NextResponse } from "next/server";
import { search } from "@/lib/queries";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";
import { defaultLocale, isLocale } from "@/lib/i18n";

const RATE_LIMIT_SEARCH = Number(process.env.RATE_LIMIT_SEARCH ?? 60);

export async function GET(request: Request) {
  const rl = await rateLimit(clientKey(request, "search"), RATE_LIMIT_SEARCH);
  if (!rl.allowed) {
    return NextResponse.json(
      { query: "", products: [], articles: [], total: 0, error: "rate-limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? "";

  // Bahasa dikirim pemanggil (overlay pencarian di header). Nilai tak dikenal
  // jatuh ke bahasa default, jadi endpoint tetap aman dari input sembarangan.
  const rawLocale = params.get("locale");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  if (q.trim().length < 2) {
    return NextResponse.json({ query: q, products: [], articles: [], total: 0 });
  }

  try {
    const res = await search(q, locale, 8);
    return NextResponse.json({
      query: res.query,
      total: res.total,
      products: res.products.slice(0, 5).map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        imageUrl: p.imageUrl,
      })),
      articles: res.articles.slice(0, 3).map((a) => ({
        slug: a.slug,
        title: a.title,
        category: a.category,
      })),
    });
  } catch {
    return NextResponse.json({ query: q, products: [], articles: [], total: 0 }, { status: 500 });
  }
}
