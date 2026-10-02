/**
 * /api/webhooks/xendit — callback status pembayaran Xendit (Fase 9.2).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Penjaga berlapis:
 *   1. Verifikasi 'x-callback-token' — tanpa ini order bisa dipalsukan lunas.
 *   2. IDEMPOTEN — Xendit bisa mengirim callback yang sama berkali-kali; order
 *      yang sudah "paid" tidak diproses ulang (stok tidak dikurangi dua kali,
 *      email tidak dikirim dua kali).
 *   3. Pengurangan stok ATOMIK lewat SQL kondisional, sehingga dua pembeli yang
 *      memperebutkan stok terakhir tidak sama-sama berhasil.
 *
 * Selalu membalas 200 untuk callback yang terverifikasi (bahkan saat order tidak
 * ditemukan atau sudah diproses), supaya Xendit berhenti mengulang. Hanya error
 * verifikasi yang dibalas 401/400.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { resolveIntegrations } from "@/lib/integrations";
import { verifyCallbackToken } from "@/lib/xendit";
import { createShipmentForOrder } from "@/lib/shipping";
import { sendEmail } from "@/lib/email";

export const maxDuration = 30;

/**
 * Klaim order jadi "paid" secara ATOMIK. Mengembalikan true hanya bila
 * callback INI yang berhasil mengubah status dari non-paid → paid; callback
 * duplikat/berbarengan mendapat false dan harus berhenti.
 *
 * Nama kolom mengikuti Payload postgres (snake_case): orders.payment_status.
 * Bila pool tidak tersedia, jatuh ke read-then-write (celah race kecil, hanya
 * dipakai sebagai upaya terakhir).
 */
async function claimOrderPaid(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  orderId: number | string,
): Promise<boolean> {
  const pool = (
    payload.db as unknown as {
      pool?: {
        query: (q: string, v: unknown[]) => Promise<{ rowCount: number }>;
      };
    }
  ).pool;

  if (pool) {
    try {
      const r = await pool.query(
        "UPDATE orders SET payment_status = 'paid' WHERE id = $1 AND payment_status <> 'paid'",
        [orderId],
      );
      return r.rowCount === 1;
    } catch {
      /* jatuh ke jalur non-atomik */
    }
  }

  try {
    const cur: any = await payload.findByID({
      collection: "orders",
      id: orderId as any,
      depth: 0,
    });
    if (cur?.paymentStatus === "paid") return false;
    await payload.update({
      collection: "orders",
      id: orderId as any,
      overrideAccess: true,
      data: { paymentStatus: "paid" },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Kurangi stok secara atomik. Mengembalikan daftar item yang stoknya kurang
 * (seharusnya kosong — stok sudah dicek saat checkout — tapi tetap dicatat).
 */
async function decrementStock(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  items: {
    product?: number | string | { id: number | string } | null;
    quantity: number;
    nameSnapshot: string;
  }[],
): Promise<string[]> {
  const shortfalls: string[] = [];
  // pg Pool dari adapter postgres — update kondisional aman dari race.
  const pool = (
    payload.db as unknown as {
      pool?: {
        query: (q: string, v: unknown[]) => Promise<{ rowCount: number }>;
      };
    }
  ).pool;

  for (const it of items) {
    if (it.product == null) continue;
    // Pengaman ganda: bila relasi sempat terpopulasi jadi objek, ambil id-nya.
    const productId =
      typeof it.product === "object"
        ? (it.product as { id: number | string }).id
        : it.product;
    if (productId == null) continue;
    if (pool) {
      try {
        const r = await pool.query(
          "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1",
          [it.quantity, productId],
        );
        if (r.rowCount === 0) shortfalls.push(it.nameSnapshot);
        continue;
      } catch {
        /* jatuh ke jalur non-atomik di bawah */
      }
    }
    // Fallback (tanpa pool): read-modify-write, kurang aman tapi tetap jalan.
    try {
      const p: any = await payload.findByID({
        collection: "products",
        id: productId as any,
        depth: 0,
      });
      const current = typeof p?.stock === "number" ? p.stock : 0;
      await payload.update({
        collection: "products",
        id: productId as any,
        overrideAccess: true,
        data: { stock: Math.max(0, current - it.quantity) },
      });
      if (current < it.quantity) shortfalls.push(it.nameSnapshot);
    } catch {
      shortfalls.push(it.nameSnapshot);
    }
  }
  return shortfalls;
}

function orderConfirmationEmail(order: any): string {
  const rows = (order.items ?? [])
    .map(
      (i: any) =>
        `<tr><td style="padding:4px 8px">${i.nameSnapshot} × ${i.quantity}</td><td style="padding:4px 8px;text-align:right">Rp${i.lineTotal.toLocaleString("id-ID")}</td></tr>`,
    )
    .join("");
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px">
      <h2>Terima kasih, pesananmu sudah dibayar ✓</h2>
      <p>Nomor pesanan: <strong>${order.orderNumber}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0">${rows}</table>
      <p style="text-align:right">Total: <strong>Rp${order.total.toLocaleString("id-ID")}</strong></p>
      <p>Kami akan segera memproses pengiriman dan mengirimkan nomor resi.</p>
      <p style="color:#888;font-size:12px">Noblekase · PT Solusi Inovasi Bangsa</p>
    </div>`;
}

export async function POST(request: Request) {
  const integrations = await resolveIntegrations();

  // 1. Verifikasi token.
  const token = request.headers.get("x-callback-token");
  if (!verifyCallbackToken(token, integrations.xenditWebhookToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event: any;
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const externalId: string | undefined = event?.external_id;
  const status: string = String(event?.status ?? "").toUpperCase();
  if (!externalId) return NextResponse.json({ received: true });

  const payload = await getPayloadClient();

  const found = await payload.find({
    collection: "orders",
    where: { orderNumber: { equals: externalId } },
    limit: 1,
    overrideAccess: true,
    // depth 0 WAJIB: tanpa ini Payload mempopulasi items[].product menjadi objek
    // Product, dan pengurangan stok (yang memakai product sebagai id di SQL)
    // jadi gagal diam-diam — stok tidak pernah berkurang.
    depth: 0,
  });
  const order: any = found.docs[0];
  if (!order) return NextResponse.json({ received: true }); // ack, jangan diulang

  // 2. Short-circuit murah bila jelas sudah final.
  if (order.paymentStatus === "paid")
    return NextResponse.json({ received: true });

  if (status === "PAID" || status === "SETTLED") {
    // 2a. Pertahanan berlapis: nominal yang dibayar harus cocok dengan total
    // order. Invoice dibuat server-side dengan amount tetap, jadi normalnya
    // selalu cocok — tapi mencocokkan di sini menolak callback yang (lewat
    // token bocor atau pembayaran sebagian) melunasi lebih kecil dari semestinya.
    const paidAmount = Number(event?.paid_amount ?? event?.amount);
    if (Number.isFinite(paidAmount) && paidAmount < Number(order.total)) {
      await payload
        .update({
          collection: "orders",
          id: order.id,
          overrideAccess: true,
          data: {
            adminNotes: `${order.adminNotes ? order.adminNotes + "\n" : ""}⚠ Nominal bayar (${paidAmount}) < total (${order.total}). Perlu cek manual.`,
          },
        })
        .catch(() => {});
      return NextResponse.json({ received: true });
    }

    // 2b. KLAIM ATOMIK: ubah pending→paid dalam satu UPDATE kondisional.
    // Inilah penjaga anti-duplikat yang sebenarnya — bukan sekadar cek baca
    // di atas. Dua callback PAID yang datang bersamaan sama-sama lolos cek
    // baca, tapi hanya SATU yang rowCount-nya 1 di sini; yang kalah berhenti,
    // sehingga stok, resi, dan email tidak diproses dua kali.
    const claimed = await claimOrderPaid(payload, order.id);
    if (!claimed) return NextResponse.json({ received: true });

    // Lengkapi metadata pembayaran (idempoten).
    await payload
      .update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        data: {
          payment: {
            ...(order.payment ?? {}),
            method:
              event?.payment_method ?? event?.payment_channel ?? undefined,
            paidAt: event?.paid_at ?? new Date().toISOString(),
          },
        },
      })
      .catch(() => {});

    const shortfalls = await decrementStock(payload, order.items ?? []);
    if (shortfalls.length) {
      await payload
        .update({
          collection: "orders",
          id: order.id,
          overrideAccess: true,
          data: {
            adminNotes: `${order.adminNotes ? order.adminNotes + "\n" : ""}⚠ Stok kurang saat pembayaran: ${shortfalls.join(", ")}. Perlu cek manual.`,
          },
        })
        .catch(() => {});
    }

    // 3. Buat resi Biteship (gagal-aman — kegagalan dicatat, tidak membatalkan
    //    pembayaran yang sudah masuk).
    try {
      const shipment = await createShipmentForOrder(
        payload,
        integrations.biteshipApiKey,
        order,
      );
      await payload.update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        data: {
          fulfillmentStatus: "processing",
          shipping: {
            ...(order.shipping ?? {}),
            biteshipOrderId: shipment.id,
            waybillId: shipment.waybillId ?? order.shipping?.waybillId,
            trackingStatus: shipment.status ?? undefined,
          },
        },
      });
    } catch (err) {
      console.error("Gagal buat resi Biteship:", err);
      await payload
        .update({
          collection: "orders",
          id: order.id,
          overrideAccess: true,
          data: {
            adminNotes: `${order.adminNotes ? order.adminNotes + "\n" : ""}⚠ Resi Biteship gagal dibuat otomatis: ${err instanceof Error ? err.message : "error"}. Buat manual.`,
          },
        })
        .catch(() => {});
    }

    // 4. Email konfirmasi (gagal-aman) — lewat Resend API pakai key hasil
    //    resolveIntegrations, supaya key yang diisi di CMS ikut terpakai.
    const html = orderConfirmationEmail(order);
    const adminTo = process.env.ADMIN_EMAIL || integrations.emailReplyTo;
    await sendEmail({
      apiKey: integrations.resendApiKey,
      from: integrations.emailFrom,
      replyTo: integrations.emailReplyTo,
      to: order.customerEmail,
      subject: `Pesanan ${order.orderNumber} sudah dibayar`,
      html,
    });
    if (adminTo) {
      await sendEmail({
        apiKey: integrations.resendApiKey,
        from: integrations.emailFrom,
        to: adminTo,
        subject: `[Order baru] ${order.orderNumber} — Rp${Number(order.total).toLocaleString("id-ID")}`,
        html,
      });
    }

    return NextResponse.json({ received: true });
  }

  if (status === "EXPIRED") {
    await payload.update({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
      data: { paymentStatus: "expired" },
    });
    return NextResponse.json({ received: true });
  }

  // Status lain (mis. PENDING) — cukup di-ack.
  return NextResponse.json({ received: true });
}
