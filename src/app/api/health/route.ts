/**
 * Health Check Endpoint — GET /api/health
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Untuk monitoring uptime (Caddy health_uri, UptimeRobot, dll).
 * Mengembalikan 200 hanya bila aplikasi DAN database dapat diakses;
 * 503 bila database bermasalah, supaya monitor benar-benar mendeteksi
 * gangguan (versi sebelumnya selalu 200 meski database mati).
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "error" = "ok";

  try {
    const payload = await getPayloadClient();
    // Query paling murah yang tetap menyentuh database.
    await payload.count({ collection: "users" });
  } catch {
    database = "error";
  }

  const body = {
    app: "ok" as const,
    database,
    latencyMs: Date.now() - startedAt,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: database === "ok" ? 200 : 503 });
}
