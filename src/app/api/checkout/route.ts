/**
 * /api/checkout — buat order + invoice Xendit (Sprint 9, Fase 9.2).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Alur:
 *   1. Klien mengirim HANYA slug + kuantitas + data pembeli/alamat.
 *   2. Server mengambil ulang harga, berat, dan stok dari DATABASE — harga yang
 *      dikirim klien sama sekali tidak dipercaya (cegah manipulasi dari browser).
 *   3. Buat Order status "pending".
 *   4. Buat Xendit Invoice, simpan id & url-nya ke order.
 *   5. Kembalikan invoiceUrl; klien mengarahkan pembeli ke sana.
 *
 * Ongkir belum dihitung di fase ini (Biteship = Fase 9.3), jadi shipping.cost = 0
 * dan total = subtotal. Rangka ongkir sudah ada di order, tinggal diisi nanti.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { resolveIntegrations } from "@/lib/integrations";
import { createInvoice } from "@/lib/xendit";
import { defaultLocale, isLocale, localePath } from "@/lib/i18n";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";

export const maxDuration = 30;

interface CheckoutItem {
  slug: string;
  quantity: number;
}
interface CheckoutBody {
  items?: CheckoutItem[];
  customer?: { name?: string; email?: string; phone?: string };
  shippingAddress?: {
    recipientName?: string;
    phone?: string;
    addressLine?: string;
    province?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    notes?: string;
  };
  locale?: string;
}

function bad(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  // Batasi agar endpoint tidak bisa dipakai membuat order massal.
  const rl = await rateLimit(clientKey(request, "checkout"), 20);
  if (!rl.allowed)
    return bad("Terlalu banyak permintaan. Coba lagi sebentar.", 429);

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return bad("Permintaan tidak valid.");
  }

  const locale = isLocale(body.locale) ? body.locale : defaultLocale;
  const items = (body.items ?? []).filter(
    (i) =>
      i &&
      typeof i.slug === "string" &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0,
  );
  if (items.length === 0) return bad("Keranjang kosong.");

  const c = body.customer ?? {};
  const a = body.shippingAddress ?? {};
  const required: [string | undefined, string][] = [
    [c.name, "Nama pembeli"],
    [c.email, "Email"],
    [c.phone, "Nomor telepon"],
    [a.recipientName, "Nama penerima"],
    [a.phone, "Telepon penerima"],
    [a.addressLine, "Alamat"],
    [a.province, "Provinsi"],
    [a.city, "Kota"],
    [a.postalCode, "Kode pos"],
  ];
  const missing = required
    .filter(([v]) => !v || !String(v).trim())
    .map(([, label]) => label);
  if (missing.length) return bad(`Lengkapi dulu: ${missing.join(", ")}.`);

  const payload = await getPayloadClient();
  const integrations = await resolveIntegrations();

  if (!integrations.xenditSecretKey) {
    return bad(
      "Pembayaran belum dikonfigurasi. Hubungi kami lewat halaman Dukungan.",
      503,
    );
  }

  // Ambil produk dari DB — sumber kebenaran harga/stok/berat.
  const slugs = [...new Set(items.map((i) => i.slug))];
  const res = await payload.find({
    collection: "products",
    where: {
      and: [{ slug: { in: slugs } }, { status: { equals: "published" } }],
    },
    depth: 1,
    limit: slugs.length,
    locale,
  });

  const bySlug = new Map(res.docs.map((d: any) => [d.slug, d]));

  const orderItems: {
    product: number;
    nameSnapshot: string;
    skuSnapshot?: string;
    unitPrice: number;
    quantity: number;
    weightGrams: number;
    lineTotal: number;
  }[] = [];
  const problems: string[] = [];

  for (const it of items) {
    const p: any = bySlug.get(it.slug);
    if (!p) {
      problems.push(`Produk "${it.slug}" tidak tersedia.`);
      continue;
    }
    const price = typeof p.price === "number" ? p.price : 0;
    const stock = typeof p.stock === "number" ? p.stock : 0;
    const weight = typeof p.weightGrams === "number" ? p.weightGrams : 0;
    if (price <= 0) {
      problems.push(`"${p.name}" belum punya harga.`);
      continue;
    }
    if (stock < it.quantity) {
      problems.push(`Stok "${p.name}" tidak cukup (tersisa ${stock}).`);
      continue;
    }
    orderItems.push({
      product: Number(p.id),
      nameSnapshot: p.name,
      skuSnapshot: p.sku ?? undefined,
      unitPrice: price,
      quantity: it.quantity,
      weightGrams: weight,
      lineTotal: price * it.quantity,
    });
  }

  if (problems.length)
    return bad("Sebagian item tidak bisa diproses.", 409, { problems });
  if (orderItems.length === 0) return bad("Tidak ada item yang bisa diproses.");

  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const totalWeight = orderItems.reduce(
    (s, i) => s + i.weightGrams * i.quantity,
    0,
  );
  const shippingCost = 0; // Fase 9.3 (Biteship)
  const total = subtotal + shippingCost;

  // 1. Buat order (pending). overrideAccess: endpoint publik, bukan user admin.
  let order: any;
  try {
    order = await payload.create({
      collection: "orders",
      overrideAccess: true,
      data: {
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
        // Semua field wajib sudah divalidasi di atas (array `required`), jadi
        // non-null assertion di sini aman dan memuaskan tipe generated Payload.
        customerName: c.name!,
        customerEmail: c.email!,
        customerPhone: c.phone!,
        shippingAddress: {
          recipientName: a.recipientName!,
          phone: a.phone!,
          addressLine: a.addressLine!,
          province: a.province!,
          city: a.city!,
          district: a.district,
          postalCode: a.postalCode!,
          notes: a.notes,
        },
        items: orderItems,
        subtotal,
        shipping: { cost: shippingCost, totalWeightGrams: totalWeight },
        total,
      },
    });
  } catch (err) {
    console.error("Gagal membuat order:", err);
    return bad("Gagal membuat pesanan. Coba lagi.", 500);
  }

  // 2. URL redirect — asal dari request, fallback ke env.
  const origin =
    request.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const successUrl = `${origin}${localePath(locale, "/checkout/sukses")}?order=${order.orderNumber}`;
  const failureUrl = `${origin}${localePath(locale, "/checkout/gagal")}?order=${order.orderNumber}`;

  // 3. Buat invoice Xendit.
  try {
    const invoice = await createInvoice({
      secretKey: integrations.xenditSecretKey,
      externalId: order.orderNumber,
      amount: total,
      payerEmail: c.email!,
      description: `Pesanan ${order.orderNumber} — Noblekase`,
      successRedirectUrl: successUrl,
      failureRedirectUrl: failureUrl,
      items: orderItems.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      customer: { givenNames: c.name, email: c.email, mobileNumber: c.phone },
    });

    await payload.update({
      collection: "orders",
      id: order.id,
      overrideAccess: true,
      data: {
        payment: {
          xenditInvoiceId: invoice.id,
          xenditInvoiceUrl: invoice.invoiceUrl,
        },
      },
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      invoiceUrl: invoice.invoiceUrl,
    });
  } catch (err) {
    console.error("Gagal membuat invoice Xendit:", err);
    // Order terlanjur dibuat; tandai gagal supaya tidak menggantung "pending".
    await payload
      .update({
        collection: "orders",
        id: order.id,
        overrideAccess: true,
        data: {
          paymentStatus: "failed",
          adminNotes: "Gagal membuat invoice Xendit.",
        },
      })
      .catch(() => {});
    return bad("Gagal menyiapkan pembayaran. Coba lagi.", 502);
  }
}
