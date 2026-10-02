/**
 * /api/webhooks/biteship — update status tracking pengiriman (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Keamanan: URL webhook memuat rahasia buatan sendiri sebagai query (?key=...)
 * yang dicocokkan dengan biteshipWebhookSecret. Biteship tidak selalu mengirim
 * tanda tangan standar, jadi rahasia di URL adalah cara paling andal dan penuh
 * kendali untuk menolak callback palsu.
 *
 * Selalu membalas 200 untuk callback yang terverifikasi (meski order tak ketemu)
 * agar Biteship berhenti mengulang.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { resolveIntegrations } from "@/lib/integrations";

export const maxDuration = 30;

/** Petakan status Biteship ke fulfillmentStatus internal. */
function mapFulfillment(
  status: string,
): "processing" | "shipped" | "delivered" | null {
  const s = status.toLowerCase();
  if (s === "delivered") return "delivered";
  if (
    [
      "allocated",
      "picking_up",
      "picked",
      "dropping_off",
      "in_transit",
      "on_hold",
      "courier_not_found",
    ].includes(s)
  )
    return "shipped";
  if (["confirmed", "scheduled"].includes(s)) return "processing";
  return null;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const integrations = await resolveIntegrations();

  if (
    !integrations.biteshipWebhookSecret ||
    key !== integrations.biteshipWebhookSecret
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event: any;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Biteship mengirim id order & status; nama field bisa sedikit berbeda antar
  // jenis event, jadi kita cari dari beberapa kemungkinan.
  const biteshipOrderId: string | undefined = event?.order_id ?? event?.id;
  const waybill: string | undefined =
    event?.courier_waybill_id ?? event?.courier_tracking_id;
  const status: string = String(event?.status ?? event?.courier_status ?? "");

  if (!biteshipOrderId && !waybill)
    return NextResponse.json({ received: true });

  const payload = await getPayloadClient();

  // Cari order berdasarkan biteshipOrderId; fallback ke nomor resi.
  const found = await payload.find({
    collection: "orders",
    where: biteshipOrderId
      ? { "shipping.biteshipOrderId": { equals: biteshipOrderId } }
      : { "shipping.waybillId": { equals: waybill } },
    limit: 1,
    overrideAccess: true,
  });
  const order: any = found.docs[0];
  if (!order) return NextResponse.json({ received: true });

  const nextFulfillment = mapFulfillment(status);

  await payload.update({
    collection: "orders",
    id: order.id,
    overrideAccess: true,
    data: {
      ...(nextFulfillment ? { fulfillmentStatus: nextFulfillment } : {}),
      shipping: {
        ...(order.shipping ?? {}),
        trackingStatus: status || order.shipping?.trackingStatus,
        waybillId: waybill ?? order.shipping?.waybillId,
      },
    },
  });

  return NextResponse.json({ received: true });
}
