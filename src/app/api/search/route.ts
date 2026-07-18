/**
 * /api/search — endpoint JSON ringan untuk saran pencarian di header.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Halaman hasil lengkap ada di /cari. Endpoint ini hanya mengembalikan
 * beberapa item teratas agar dropdown tetap ringan.
 */

import { NextResponse } from "next/server";
import { search } from "@/lib/queries";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return NextResponse.json({ query: q, products: [], articles: [], total: 0 });
  }

  try {
    const res = await search(q, 8);
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
