/**
 * publishHooks.ts — aksi setelah konten dipublish: segarkan cache Next
 * dan (opsional) beri tahu Google Indexing API.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Semua dibungkus try/catch: kegagalan revalidate/indexing TIDAK BOLEH
 * menggagalkan penyimpanan dokumen di admin.
 */

import { revalidatePath } from "next/cache";
import { notifyGoogleIndexing } from "@/lib/googleIndexing";
import { localePath, locales } from "@/lib/i18n";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Segarkan daftar path dan kirim URL kanonik ke Google.
 *
 * Pemanggil mengoper path NETRAL tanpa prefix bahasa (mis. "/journal/slug").
 * Fungsi ini yang mengembangkannya ke semua bahasa, karena satu perubahan
 * dokumen di CMS mengubah versi ID maupun EN sekaligus — kalau hanya versi
 * Indonesia yang di-revalidate, halaman /en akan menyajikan konten basi.
 *
 * Path internal (/id/…) ikut disegarkan di samping path publik (/…) sebab
 * middleware me-rewrite bahasa default, sehingga cache bisa tersimpan di
 * bawah salah satu dari keduanya.
 *
 * @param paths path relatif tanpa prefix bahasa, mis. ["/", "/produk"]
 * @param canonicalPath path yang dikirim ke Google Indexing (opsional)
 */
export async function refreshAfterPublish(
  paths: string[],
  canonicalPath?: string,
  isPublished = true,
) {
  const expanded = new Set<string>();
  for (const p of paths) {
    expanded.add(p);
    for (const locale of locales) {
      expanded.add(localePath(locale, p));
      expanded.add(`/${locale}${p === "/" ? "" : p}`);
    }
  }

  for (const p of expanded) {
    try {
      revalidatePath(p);
    } catch {
      /* di luar konteks request Next — abaikan */
    }
  }

  if (!canonicalPath || !isPublished) return;
  // Jangan kirim URL localhost ke Google.
  if (!/^https?:\/\/(?!localhost|127\.)/i.test(SITE)) return;

  // Kedua bahasa punya URL sendiri, jadi keduanya perlu diajukan terpisah.
  for (const locale of locales) {
    try {
      await notifyGoogleIndexing(
        `${SITE.replace(/\/$/, "")}${localePath(locale, canonicalPath)}`,
      );
    } catch {
      /* gagal-aman */
    }
  }
}
