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
import { getRates } from "@/lib/biteship";
import { getShippingConfig, loadRateItems } from "@/lib/shipping";
import { reserveStock, releaseStock, restoreItems } from "@/lib/stock";
import { defaultLocale, isLocale, localePath, type Locale } from "@/lib/i18n";
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
    biteshipAreaId?: string;
    notes?: string;
  };
  /** Kurir yang dipilih pembeli; ongkirnya DIHITUNG ULANG di server. */
  courier?: { company?: string; type?: string };
  locale?: string;
}

function bad(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Pesan error dua bahasa. Dipisah dari kamus UI karena hanya dipakai di
 * endpoint ini dan sebagian menyisipkan nilai ({fields}/{name}/{stock}).
 * Tanpa ini, pembeli berbahasa Inggris melihat pesan error Bahasa Indonesia.
 */
const MSG: Record<Locale, Record<string, string>> = {
  id: {
    tooMany: "Terlalu banyak permintaan. Coba lagi sebentar.",
    invalid: "Permintaan tidak valid.",
    emptyCart: "Keranjang kosong.",
    missing: "Lengkapi dulu: {fields}.",
    payNotConfigured:
      "Pembayaran belum dikonfigurasi. Hubungi kami lewat halaman Dukungan.",
    itemsProblem: "Sebagian item tidak bisa diproses.",
    noItems: "Tidak ada item yang bisa diproses.",
    shipNotConfigured:
      "Pengiriman belum dikonfigurasi. Hubungi kami lewat halaman Dukungan.",
    shipItemsProblem: "Sebagian item tidak bisa dikirim.",
    rateChanged: "Ongkir untuk kurir ini sudah berubah. Pilih ulang kurirnya.",
    rateFailed: "Gagal menghitung ongkir. Coba lagi.",
    createFailed: "Gagal membuat pesanan. Coba lagi.",
    invoiceFailed: "Gagal menyiapkan pembayaran. Coba lagi.",
    unavailable: 'Produk "{slug}" tidak tersedia.',
    noPrice: '"{name}" belum punya harga.',
    insufficientStock: 'Stok "{name}" tidak cukup (tersisa {stock}).',
    reserveFailed:
      'Stok "{name}" keburu habis. Kurangi jumlah atau pilih produk lain.',
    fName: "Nama pembeli",
    fEmail: "Email",
    fPhone: "Nomor telepon",
    fRecipient: "Nama penerima",
    fRecipientPhone: "Telepon penerima",
    fAddress: "Alamat",
    fProvince: "Provinsi",
    fCity: "Kota",
    fPostal: "Kode pos",
    fArea: "Area pengiriman (pilih dari daftar)",
    fCourier: "Kurir",
    fCourierType: "Layanan kurir",
  },
  en: {
    tooMany: "Too many requests. Please try again shortly.",
    invalid: "Invalid request.",
    emptyCart: "Your cart is empty.",
    missing: "Please complete: {fields}.",
    payNotConfigured:
      "Payments are not configured yet. Please reach us via the Support page.",
    itemsProblem: "Some items could not be processed.",
    noItems: "No items could be processed.",
    shipNotConfigured:
      "Shipping is not configured yet. Please reach us via the Support page.",
    shipItemsProblem: "Some items cannot be shipped.",
    rateChanged:
      "The rate for this courier changed. Please reselect a courier.",
    rateFailed: "Failed to calculate shipping. Please try again.",
    createFailed: "Failed to create the order. Please try again.",
    invoiceFailed: "Failed to set up payment. Please try again.",
    unavailable: 'Product "{slug}" is unavailable.',
    noPrice: '"{name}" has no price yet.',
    insufficientStock: 'Not enough stock for "{name}" ({stock} left).',
    reserveFailed:
      '"{name}" just went out of stock. Reduce the quantity or pick another product.',
    fName: "Buyer name",
    fEmail: "Email",
    fPhone: "Phone number",
    fRecipient: "Recipient name",
    fRecipientPhone: "Recipient phone",
    fAddress: "Address",
    fProvince: "Province",
    fCity: "City",
    fPostal: "Postal code",
    fArea: "Shipping area (pick from the list)",
    fCourier: "Courier",
    fCourierType: "Courier service",
  },
};

function m(
  locale: Locale,
  key: string,
  vars: Record<string, string | number> = {},
) {
  const template = MSG[locale][key] ?? MSG[defaultLocale][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export async function POST(request: Request) {
  // Batasi agar endpoint tidak bisa dipakai membuat order massal.
  const rl = await rateLimit(clientKey(request, "checkout"), 20);
  if (!rl.allowed) return bad(m(defaultLocale, "tooMany"), 429);

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return bad(m(defaultLocale, "invalid"));
  }

  const locale = isLocale(body.locale) ? body.locale : defaultLocale;
  const items = (body.items ?? []).filter(
    (i) =>
      i &&
      typeof i.slug === "string" &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0,
  );
  if (items.length === 0) return bad(m(locale, "emptyCart"));

  const c = body.customer ?? {};
  const a = body.shippingAddress ?? {};
  const required: [string | undefined, string][] = [
    [c.name, m(locale, "fName")],
    [c.email, m(locale, "fEmail")],
    [c.phone, m(locale, "fPhone")],
    [a.recipientName, m(locale, "fRecipient")],
    [a.phone, m(locale, "fRecipientPhone")],
    [a.addressLine, m(locale, "fAddress")],
    [a.province, m(locale, "fProvince")],
    [a.city, m(locale, "fCity")],
    [a.postalCode, m(locale, "fPostal")],
    [a.biteshipAreaId, m(locale, "fArea")],
    [body.courier?.company, m(locale, "fCourier")],
    [body.courier?.type, m(locale, "fCourierType")],
  ];
  const missing = required
    .filter(([v]) => !v || !String(v).trim())
    .map(([, label]) => label);
  if (missing.length)
    return bad(m(locale, "missing", { fields: missing.join(", ") }));

  const payload = await getPayloadClient();
  const integrations = await resolveIntegrations();

  if (!integrations.xenditSecretKey) {
    return bad(m(locale, "payNotConfigured"), 503);
  }

  // Bila pembeli login sebagai pelanggan, tautkan order ke akunnya (opsional —
  // checkout tamu tetap jalan tanpa ini). Riwayat akun juga tetap cocok lewat
  // email, jadi tautan ini sekadar bonus relasi.
  let customerId: number | string | undefined;
  try {
    const { user } = await payload.auth({ headers: request.headers });
    if (user && (user as { collection?: string }).collection === "customers") {
      customerId = (user as { id: number | string }).id;
    }
  } catch {
    /* tidak login — abaikan */
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
      problems.push(m(locale, "unavailable", { slug: it.slug }));
      continue;
    }
    const price = typeof p.price === "number" ? p.price : 0;
    const stock = typeof p.stock === "number" ? p.stock : 0;
    const weight = typeof p.weightGrams === "number" ? p.weightGrams : 0;
    if (price <= 0) {
      problems.push(m(locale, "noPrice", { name: p.name }));
      continue;
    }
    if (stock < it.quantity) {
      problems.push(m(locale, "insufficientStock", { name: p.name, stock }));
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

  if (problems.length) return bad(m(locale, "itemsProblem"), 409, { problems });
  if (orderItems.length === 0) return bad(m(locale, "noItems"));

  const subtotal = orderItems.reduce((s, i) => s + i.lineTotal, 0);
  const totalWeight = orderItems.reduce(
    (s, i) => s + i.weightGrams * i.quantity,
    0,
  );

  // === Ongkir: DIHITUNG ULANG dari Biteship, tidak percaya harga dari klien ===
  const shipConfig = await getShippingConfig(
    payload,
    integrations.biteshipApiKey,
  );
  if (!shipConfig.ready) {
    return bad(m(locale, "shipNotConfigured"), 503);
  }

  const { rateItems, problems: shipProblems } = await loadRateItems(
    payload,
    items,
    locale,
  );
  if (shipProblems.length)
    return bad(m(locale, "shipItemsProblem"), 409, {
      problems: shipProblems,
    });

  let shippingCost = 0;
  let courierName = "";
  let etaText = "";
  try {
    const rates = await getRates(integrations.biteshipApiKey!, {
      originAreaId: shipConfig.origin.areaId,
      destinationAreaId: a.biteshipAreaId!,
      couriers: shipConfig.couriers,
      items: rateItems,
    });
    const chosen = rates.find(
      (r) =>
        r.courierCompany === body.courier!.company &&
        r.courierType === body.courier!.type,
    );
    if (!chosen) {
      // Tarif berubah / kurir tak lagi tersedia — minta pembeli memilih ulang
      // daripada diam-diam memakai harga lama.
      return bad(m(locale, "rateChanged"), 409, { rates });
    }
    shippingCost = chosen.price;
    courierName =
      chosen.courierName + (chosen.serviceName ? ` ${chosen.serviceName}` : "");
    etaText = chosen.etaText;
  } catch (err) {
    console.error("Gagal hitung ongkir saat checkout:", err);
    return bad(m(locale, "rateFailed"), 502);
  }

  const total = subtotal + shippingCost;

  // === RESERVE STOK (atomik) sebelum order & invoice dibuat ===
  // Inilah penjaga anti-oversell: stok dikurangi sekarang, dan dikembalikan
  // bila pembayaran kedaluwarsa/gagal/refund. Harus dilakukan SEBELUM membuat
  // invoice supaya pembeli tidak pernah membayar barang yang stoknya keburu
  // diambil orang lain.
  const reservation = await reserveStock(payload, orderItems);
  if (!reservation.ok) {
    return bad(
      m(locale, "reserveFailed", { name: reservation.insufficient ?? "" }),
      409,
    );
  }

  // 1. Buat order (pending). overrideAccess: endpoint publik, bukan user admin.
  let order: any;
  try {
    order = await payload.create({
      collection: "orders",
      overrideAccess: true,
      data: {
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
        ...(customerId ? { customer: Number(customerId) } : {}),
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
          biteshipAreaId: a.biteshipAreaId,
          notes: a.notes,
        },
        items: orderItems,
        subtotal,
        shipping: {
          courierCompany: body.courier!.company,
          courierType: body.courier!.type,
          courierName,
          cost: shippingCost,
          etaText,
          totalWeightGrams: totalWeight,
        },
        total,
      },
    });
  } catch (err) {
    console.error("Gagal membuat order:", err);
    // Order gagal dibuat setelah stok di-reserve — kembalikan agar tidak hilang.
    await restoreItems(payload, orderItems).catch(() => {});
    return bad(m(locale, "createFailed"), 500);
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
    // Order terlanjur dibuat & stok sudah di-reserve. Lepas stok kembali dan
    // tandai gagal supaya tidak menggantung "pending" sambil menahan stok.
    await releaseStock(payload, order).catch(() => {});
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
    return bad(m(locale, "invoiceFailed"), 502);
  }
}
