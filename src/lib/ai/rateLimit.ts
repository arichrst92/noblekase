/**
 * rateLimit.ts — pembatas laju sederhana (sliding window) di memori proses.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * BATASAN YANG PERLU DIKETAHUI: penyimpanannya per-proses. Cukup untuk
 * deployment satu instance (kondisi saat ini). Bila nanti scale ke banyak
 * instance/serverless, pindahkan ke Redis (REDIS_URL sudah tersedia di env)
 * agar hitungannya konsisten lintas proses.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** Bersihkan entri kedaluwarsa sesekali agar Map tidak tumbuh terus. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  hit.count += 1;
  const allowed = hit.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - hit.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((hit.resetAt - now) / 1000),
  };
}

/** Ambil identitas pemanggil dari header proxy yang umum. */
export function clientKey(request: Request): string {
  const h = request.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return `ai-chat:${ip}`;
}
