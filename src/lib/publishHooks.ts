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

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Segarkan daftar path dan kirim URL kanonik ke Google.
 * @param paths path relatif yang perlu di-revalidate, mis. ["/", "/produk"]
 * @param canonicalPath path yang dikirim ke Google Indexing (opsional)
 */
export async function refreshAfterPublish(
  paths: string[],
  canonicalPath?: string,
  isPublished = true,
) {
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      /* di luar konteks request Next — abaikan */
    }
  }

  if (!canonicalPath || !isPublished) return;
  // Jangan kirim URL localhost ke Google.
  if (!/^https?:\/\/(?!localhost|127\.)/i.test(SITE)) return;

  try {
    await notifyGoogleIndexing(`${SITE.replace(/\/$/, "")}${canonicalPath}`);
  } catch {
    /* gagal-aman */
  }
}
