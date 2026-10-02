/**
 * /api/account/orders — riwayat pesanan milik pelanggan yang login (Fase akun).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Order bersifat admin-only, jadi endpoint ini mengautentikasi pelanggan dari
 * cookie-nya (payload.auth) dan hanya mengembalikan order yang email-nya sama
 * dengan email akun — mencocokkan pesanan tamu lama sekalipun.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

export async function GET(request: Request) {
  const payload = await getPayloadClient();

  // Identitas dari cookie auth. Harus milik collection customers.
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || (user as { collection?: string }).collection !== "customers") {
    return NextResponse.json(
      { authenticated: false, orders: [] },
      { status: 401 },
    );
  }

  const email = (user as { email?: string }).email?.toLowerCase();
  if (!email) return NextResponse.json({ authenticated: true, orders: [] });

  const found = await payload.find({
    collection: "orders",
    where: { customerEmail: { equals: email } },
    sort: "-createdAt",
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });

  const orders = found.docs.map((o: any) => ({
    orderNumber: o.orderNumber,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    total: o.total,
    courierName: o.shipping?.courierName ?? "",
    waybillId: o.shipping?.waybillId ?? "",
    createdAt: o.createdAt,
    items: (o.items ?? []).map((i: any) => ({
      name: i.nameSnapshot,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
  }));

  return NextResponse.json({
    authenticated: true,
    name: (user as { name?: string }).name ?? "",
    email,
    orders,
  });
}
