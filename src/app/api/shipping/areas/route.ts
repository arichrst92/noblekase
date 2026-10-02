/**
 * /api/shipping/areas — autocomplete area tujuan Biteship (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Proxy tipis ke pencarian area Biteship supaya API key tidak pernah sampai ke
 * browser. Dipakai form checkout untuk mengubah ketikan alamat jadi area id.
 */

import { NextResponse } from "next/server";
import { resolveIntegrations } from "@/lib/integrations";
import { searchAreas } from "@/lib/biteship";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";

export async function GET(request: Request) {
  const rl = await rateLimit(clientKey(request, "ship-areas"), 60);
  if (!rl.allowed) return NextResponse.json({ areas: [] }, { status: 429 });

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) return NextResponse.json({ areas: [] });

  const integrations = await resolveIntegrations();
  if (!integrations.biteshipApiKey) {
    return NextResponse.json(
      { areas: [], error: "not-configured" },
      { status: 503 },
    );
  }

  try {
    const areas = await searchAreas(integrations.biteshipApiKey, q);
    return NextResponse.json({ areas: areas.slice(0, 10) });
  } catch (err) {
    console.error("Biteship areas error:", err);
    return NextResponse.json({ areas: [] }, { status: 502 });
  }
}
