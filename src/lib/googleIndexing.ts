/**
 * googleIndexing.ts — kirim notifikasi URL ke Google Indexing API.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Kredensial diambil dari CMS (Admin → System → API Keys & Integrasi →
 * Google, field "indexingServiceAccountJson"), fallback ke .env.
 *
 * SELALU gagal-aman: bila kredensial kosong atau Google menolak, fungsi
 * hanya mengembalikan status dan TIDAK PERNAH melempar error — supaya
 * proses publish konten di admin tidak ikut gagal.
 *
 * Catatan: Indexing API resmi Google ditujukan untuk JobPosting dan
 * BroadcastEvent. Untuk halaman biasa, sitemap + Search Console tetap
 * jalur utama; ini pelengkap agar perubahan cepat diketahui.
 */

import crypto from "crypto";
import { resolveIntegrations } from "@/lib/integrations";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const INDEXING_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const SCOPE = "https://www.googleapis.com/auth/indexing";

type ServiceAccount = { client_email?: string; private_key?: string };

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  if (!sa.client_email || !sa.private_key) return null;

  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      exp: iat + 3600,
      iat,
    }),
  );
  const signature = b64url(
    crypto.createSign("RSA-SHA256").update(`${header}.${claim}`).sign(sa.private_key.replace(/\\n/g, "\n")),
  );
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

export type IndexingResult =
  | { ok: true }
  | { ok: false; reason: "no-credentials" | "auth-failed" | "request-failed" | "error" };

/** Beri tahu Google bahwa sebuah URL diperbarui atau dihapus. */
export async function notifyGoogleIndexing(
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED",
): Promise<IndexingResult> {
  try {
    const { indexingServiceAccountJson } = await resolveIntegrations();
    if (!indexingServiceAccountJson) return { ok: false, reason: "no-credentials" };

    let sa: ServiceAccount;
    try {
      sa = JSON.parse(indexingServiceAccountJson);
    } catch {
      return { ok: false, reason: "no-credentials" };
    }

    const token = await getAccessToken(sa);
    if (!token) return { ok: false, reason: "auth-failed" };

    const res = await fetch(INDEXING_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, type }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "request-failed" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
