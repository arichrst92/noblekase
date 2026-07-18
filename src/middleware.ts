/**
 * middleware.ts — pemetaan URL publik ke segmen [locale] internal.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Aturannya:
 *   /produk      → rewrite ke /id/produk   (URL di browser tetap /produk)
 *   /en/produk   → diteruskan apa adanya
 *   /id/produk   → redirect permanen ke /produk, supaya tiap halaman hanya
 *                  punya SATU URL kanonik dan Google tidak melihat konten
 *                  ganda.
 *
 * Rewrite (bukan redirect) dipakai untuk bahasa default agar URL Indonesia
 * tetap bersih tanpa prefix — ini juga menjaga semua tautan lama tetap hidup.
 *
 * Yang TIDAK boleh disentuh: panel admin Payload, REST/GraphQL API, aset
 * Next, berkas upload, dan berkas statis di /public. Semuanya dikecualikan
 * lewat `config.matcher` di bawah plus penjaga tambahan di dalam fungsi.
 */

import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

/** Prefix yang tidak pernah diberi locale. */
const EXCLUDED_PREFIXES = ["/admin", "/api", "/_next", "/images", "/media", "/uploads"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Penjaga kedua (matcher sudah menyaring, ini untuk kasus tepi).
  if (EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // /id/... → buang prefiks, bahasa default tidak memakai prefix.
  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${segments.slice(1).join("/")}` || "/";
    return NextResponse.redirect(url, 308);
  }

  // /en/... → sudah sesuai bentuk internal, teruskan.
  if (isLocale(first)) {
    return NextResponse.next();
  }

  // Tanpa prefix → konten Indonesia. Rewrite ke segmen internal.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path KECUALI:
     *   admin, api           — Payload
     *   _next                — aset build Next
     *   images, media, uploads — berkas statis & hasil upload
     *   berkas ber-ekstensi  — robots.txt, sitemap.xml, favicon.ico, dll
     */
    /*
     * Pengecualian di-anchor per segmen — `(?:/|$)` mencegah slug sah seperti
     * /mediakit atau /apidocs ikut terlewat. Pola berkas memakai [^/]* agar
     * hanya segmen TERAKHIR yang dianggap nama berkas, sehingga slug yang
     * mengandung titik (mis. /produk/detail/anker-2.0) tetap dirender.
     */
    "/((?!(?:admin|api|_next|images|media|uploads)(?:/|$)|[^/]*\\.[\\w]+$).*)",
  ],
};

// Referensi agar daftar locale ikut ter-typecheck bila nanti bertambah.
export const supportedLocales = locales;
