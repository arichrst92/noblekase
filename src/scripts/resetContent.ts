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

  for (const collection of ORDER) {
    try {
      const before = await payload.count({ collection: collection as any });
      if (before.totalDocs === 0) {
        payload.logger.info(`— ${collection}: kosong, dilewati`);
        continue;
      }
      await payload.delete({
        collection: collection as any,
        where: { id: { exists: true } },
      });
      const after = await payload.count({ collection: collection as any });
      payload.logger.info(`✔ ${collection}: ${before.totalDocs} → ${after.totalDocs} dihapus`);
    } catch (err) {
      payload.logger.error(`✖ Gagal menghapus ${collection}: ${(err as Error).message}`);
    }
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
