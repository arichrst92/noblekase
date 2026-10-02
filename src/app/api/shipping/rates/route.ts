/**
 * /api/shipping/rates — hitung ongkir real-time (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Input klien: area tujuan + daftar slug & kuantitas. Berat diambil dari DB.
 * Mengembalikan daftar opsi kurir + ongkir untuk dipilih pembeli di checkout.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { resolveIntegrations } from "@/lib/integrations";
import { getRates } from "@/lib/biteship";
import { getShippingConfig, loadRateItems } from "@/lib/shipping";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";

export const maxDuration = 30;

export async function POST(request: Request) {
  const rl = await rateLimit(clientKey(request, "ship-rates"), 40);
  if (!rl.allowed)
    return NextResponse.json(
      { error: "rate-limited", rates: [] },
      { status: 429 },
    );

  let body: {
    destinationAreaId?: string;
    items?: { slug: string; quantity: number }[];
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid", rates: [] }, { status: 400 });
  }

  const locale = isLocale(body.locale) ? body.locale : defaultLocale;
  const destinationAreaId = body.destinationAreaId?.trim();
  const items = (body.items ?? []).filter(
    (i) =>
      i &&
      typeof i.slug === "string" &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0,
  );
  if (!destinationAreaId)
    return NextResponse.json(
      { error: "no-destination", rates: [] },
      { status: 400 },
    );
  if (items.length === 0)
    return NextResponse.json({ error: "empty", rates: [] }, { status: 400 });

  const payload = await getPayloadClient();
  const integrations = await resolveIntegrations();
  const config = await getShippingConfig(payload, integrations.biteshipApiKey);

  if (!config.ready) {
    return NextResponse.json(
      { error: "not-configured", rates: [] },
      { status: 503 },
    );
  }

  const { rateItems, problems } = await loadRateItems(payload, items, locale);
  if (problems.length)
    return NextResponse.json(
      { error: "items", problems, rates: [] },
      { status: 409 },
    );

  try {
    const rates = await getRates(integrations.biteshipApiKey!, {
      originAreaId: config.origin.areaId,
      destinationAreaId,
      couriers: config.couriers,
      items: rateItems,
    });
    // Urutkan termurah dulu.
    rates.sort((a, b) => a.price - b.price);
    return NextResponse.json({ rates });
  } catch (err) {
    console.error("Biteship rates error:", err);
    return NextResponse.json(
      { error: "rates-failed", rates: [] },
      { status: 502 },
    );
  }
}
