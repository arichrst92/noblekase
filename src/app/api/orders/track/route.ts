/**
 * /api/orders/track — lacak pesanan untuk pembeli tamu (Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Order bersifat admin-only, jadi pelacakan publik memakai pasangan nomor order
 * + email sebagai bukti kepemilikan. Hanya mengembalikan field yang aman
 * ditampilkan ke pembeli — tanpa catatan internal, id Xendit/Biteship, dsb.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";

export async function POST(request: Request) {
  // Rate limit ketat: cegah tebak-tebakan nomor order.
  const rl = await rateLimit(clientKey(request, "order-track"), 15);
  if (!rl.allowed)
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  let body: { orderNumber?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const orderNumber = body.orderNumber?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!orderNumber || !email)
    return NextResponse.json({ error: "missing" }, { status: 400 });

  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: "orders",
    where: {
      and: [
        { orderNumber: { equals: orderNumber } },
        { customerEmail: { equals: email } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  const o: any = found.docs[0];
  // Jawaban sama untuk "tidak ketemu" dan "email tak cocok" — jangan bocorkan
  // keberadaan nomor order.
  if (!o) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    order: {
      orderNumber: o.orderNumber,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      courierName: o.shipping?.courierName ?? "",
      waybillId: o.shipping?.waybillId ?? "",
      trackingStatus: o.shipping?.trackingStatus ?? "",
      subtotal: o.subtotal,
      shippingCost: o.shipping?.cost ?? 0,
      total: o.total,
      items: (o.items ?? []).map((i: any) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      createdAt: o.createdAt,
    },
  });
}
