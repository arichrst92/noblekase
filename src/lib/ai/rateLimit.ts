/**
 * rateLimit.ts — pembatas laju (sliding window) dengan Redis + fallback memori.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Bila REDIS_URL tersedia dan terhubung, hitungan disimpan di Redis sehingga
 * konsisten lintas proses/instance. Bila Redis tidak ada atau gagal, otomatis
 * jatuh ke penghitung di memori proses — pembatasan tetap berjalan (walau
 * hanya per-instance) dan permintaan TIDAK PERNAH ditolak karena Redis error.
 */

import type { RedisClientType } from "redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  backend: "redis" | "memory";
}

/* ------------------------------ memori ------------------------------ */

type Hit = { count: number; resetAt: number };
const buckets = new Map<string, Hit>();

function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0, backend: "memory" };
  }
  hit.count += 1;
  const allowed = hit.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - hit.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((hit.resetAt - now) / 1000),
    backend: "memory",
  };
}

/* ------------------------------- redis ------------------------------ */

let redisClient: RedisClientType | null = null;
let redisReady: Promise<RedisClientType | null> | null = null;

async function getRedis(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) return null;
  if (redisClient?.isOpen) return redisClient;
  if (redisReady) return redisReady;

  redisReady = (async () => {
    try {
      const { createClient } = await import("redis");
      const client = createClient({ url: process.env.REDIS_URL }) as RedisClientType;
      // Jangan biarkan error Redis menjatuhkan proses.
      client.on("error", () => {});
      await client.connect();
      redisClient = client;
      return client;
    } catch {
      return null;
    } finally {
      redisReady = null;
    }
  })();

  return redisReady;
}

/* ------------------------------- API -------------------------------- */

export async function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const client = await getRedis();
  if (!client) return memoryLimit(key, limit, windowMs);

  try {
    const windowSec = Math.ceil(windowMs / 1000);
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSec);
    const ttl = await client.ttl(key);
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, ttl),
      backend: "redis",
    };
  } catch {
    // Redis bermasalah di tengah jalan — jangan tolak permintaan.
    return memoryLimit(key, limit, windowMs);
  }
}

/** Ambil identitas pemanggil dari header proxy yang umum. */
export function clientKey(request: Request, scope = "ai-chat"): string {
  const h = request.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `rl:${scope}:${ip}`;
}
