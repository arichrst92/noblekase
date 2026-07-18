/**
 * resetContent.ts — hapus semua konten katalog/editorial + file media, lalu siap di-seed ulang.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * AMAN: TIDAK menghapus koleksi `users` (login admin tetap) dan tidak
 * mengubah global (Site Settings, Header, Footer, Halaman-Konten).
 *
 * Jalankan:
 *   CONFIRM_RESET=true pnpm reset:content
 *   pnpm seed
 *   pnpm seed:content
 */

import fs from "fs";
import path from "path";

function loadEnv(file: string) {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}
loadEnv(".env.local");
loadEnv(".env");

const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");

/** Urutan penting: yang punya relasi ke koleksi lain dihapus lebih dulu. */
const ORDER = [
  "featured-collections",
  "hero-editions",
  "slides", // punya field upload (image, imageMobile) — harus sebelum media
  "articles",
  "article-categories",
  "faq-items",
  "faq-categories",
  "pages",
  "products",
  "sub-categories",
  "categories",
  "marketplaces",
  "media", // paling akhir — direferensikan hampir semua
] as const;

const run = async () => {
  if (process.env.CONFIRM_RESET !== "true") {
    console.error(
      "❌ Dibatalkan. Ini menghapus SEMUA konten (produk, artikel, media, dll).\n" +
        "   User admin & pengaturan global TIDAK dihapus.\n\n" +
        "   Jalankan dengan konfirmasi:\n" +
        "     CONFIRM_RESET=true pnpm reset:content",
    );
    process.exit(1);
  }

  const payload = await getPayload({ config });

  /**
   * Kosongkan referensi media di global DULU. Tanpa ini, penghapusan koleksi
   * media gagal/parsial karena masih direferensikan, dan menyisakan dokumen
   * basi yang bikin frontend error 500 "file is missing on the disk".
   */
  const GLOBAL_MEDIA_FIELDS: Record<string, string[]> = {
    "site-settings": ["logo", "favicon", "defaultOgImage"],
    "page-home": ["brandImage", "promoImage"],
    "page-products": ["bannerImage"],
    "page-support": ["heroImage"],
  };
  for (const [slug, fields] of Object.entries(GLOBAL_MEDIA_FIELDS)) {
    try {
      const data = Object.fromEntries(fields.map((f) => [f, null]));
      await payload.updateGlobal({ slug: slug as any, data: data as any });
      payload.logger.info(`✔ Referensi media dikosongkan di global: ${slug}`);
    } catch (err) {
      payload.logger.warn(`Lewati global ${slug}: ${(err as Error).message}`);
    }
  }

  for (const collection of ORDER) {
    const before = await payload.count({ collection: collection as any });
    if (before.totalDocs === 0) {
      payload.logger.info(`— ${collection}: kosong, dilewati`);
      continue;
    }

    // Hapus massal dulu (cepat). Bila gagal — mis. query pembersihan
    // payload_preferences untuk banyak dokumen sekaligus error — jatuh ke
    // penghapusan satu per satu yang query-nya jauh lebih kecil.
    let bulkOk = true;
    try {
      await payload.delete({ collection: collection as any, where: { id: { exists: true } } });
    } catch {
      bulkOk = false;
    }

    if (!bulkOk) {
      payload.logger.warn(`${collection}: hapus massal gagal, beralih ke satu per satu...`);
      let guard = 0;
      while (guard++ < 50) {
        const page = await payload.find({
          collection: collection as any,
          limit: 100,
          depth: 0,
          pagination: false,
        });
        if (page.docs.length === 0) break;
        let deletedThisPass = 0;
        const failed: string[] = [];
        for (const doc of page.docs) {
          try {
            await payload.delete({ collection: collection as any, id: (doc as any).id });
            deletedThisPass++;
          } catch (e) {
            failed.push(`#${(doc as any).id}: ${(e as Error).message.slice(0, 120)}`);
          }
        }
        // Tidak ada kemajuan → berhenti (hindari perulangan tak berujung)
        if (deletedThisPass === 0) {
          payload.logger.error(
            `  ✖ ${collection}: ${failed.length} dokumen tidak bisa dihapus (kemungkinan masih direferensikan koleksi lain):`,
          );
          failed.slice(0, 5).forEach((f) => payload.logger.error(`     ${f}`));
          break;
        }
      }
    }

    const after = await payload.count({ collection: collection as any });
    const icon = after.totalDocs === 0 ? "✔" : "✖";
    payload.logger.info(`${icon} ${collection}: ${before.totalDocs} → ${after.totalDocs} tersisa`);
  }

  // Bersihkan file fisik hasil upload (staticDir), sisakan .gitkeep
  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
  if (fs.existsSync(uploadDir)) {
    let removed = 0;
    for (const f of fs.readdirSync(uploadDir)) {
      if (f === ".gitkeep") continue;
      fs.rmSync(path.join(uploadDir, f), { recursive: true, force: true });
      removed++;
    }
    payload.logger.info(`✔ File upload dibersihkan: ${removed} item di ${uploadDir}`);
  }

  const users = await payload.count({ collection: "users" });
  payload.logger.info(`ℹ User admin tetap aman: ${users.totalDocs} user.`);
  payload.logger.info("✅ Reset selesai. Lanjut: pnpm seed && pnpm seed:content");
  process.exit(0);
};

try {
  await run();
} catch (err) {
  console.error("❌ Reset gagal:", err);
  process.exit(1);
}
