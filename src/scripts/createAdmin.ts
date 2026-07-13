/**
 * createAdmin.ts — buat user admin pertama via Payload local API.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Melewati endpoint REST /first-register. Jalankan:
 *   ADMIN_EMAIL=you@ide.asia ADMIN_PASSWORD=Rahasia123 pnpm create:admin
 *
 * Juga melaporkan jumlah user yang ada (diagnostik).
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

const run = async () => {
  const payload = await getPayload({ config });

  const count = await payload.count({ collection: "users" });
  payload.logger.info(`Jumlah user saat ini: ${count.totalDocs}`);

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    payload.logger.warn(
      "Set ADMIN_EMAIL & ADMIN_PASSWORD untuk membuat user. Contoh:\n" +
        "  ADMIN_EMAIL=you@ide.asia ADMIN_PASSWORD=Rahasia123 pnpm create:admin",
    );
    process.exit(0);
  }

  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.totalDocs > 0) {
    payload.logger.info(`User ${email} sudah ada — dilewati.`);
    process.exit(0);
  }

  const user = await payload.create({
    collection: "users",
    data: { name, email, password, role: "superAdmin" },
  });
  payload.logger.info(`✅ User superAdmin dibuat: ${user.email}. Login di /admin/login.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Gagal membuat admin:", err);
  process.exit(1);
});
