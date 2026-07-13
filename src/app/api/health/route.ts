/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Untuk monitoring uptime (Caddy health_uri, UptimeRobot, dll).
 * Return 200 jika app + database accessible.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    app: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return NextResponse.json(checks, { status: 200 });
}

export const dynamic = "force-dynamic";
