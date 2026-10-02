/**
 * shipping.ts — helper bersama untuk ongkir (Sprint 9, Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY. Menyatukan logika yang dipakai /api/shipping/rates maupun
 * /api/checkout, supaya aturan "berat & harga diambil dari DB, bukan dari klien"
 * hanya ada di satu tempat.
 */

import type { getPayloadClient } from "@/lib/payload";
import {
  createOrder,
  type RateItem,
  type BiteshipOrderResult,
} from "@/lib/biteship";
import type { Locale } from "@/lib/i18n";

type Payload = Awaited<ReturnType<typeof getPayloadClient>>;

export interface ShippingConfig {
  apiKey?: string;
  couriers: string;
  origin: {
    contactName: string;
    contactPhone: string;
    address: string;
    postalCode: string;
    areaId: string;
  };
  /** true bila gudang asal sudah lengkap untuk menghitung ongkir. */
  ready: boolean;
}

export async function getShippingConfig(
  payload: Payload,
  apiKey: string | undefined,
): Promise<ShippingConfig> {
  const g: any = await payload
    .findGlobal({ slug: "shipping-settings" as any, depth: 0 })
    .catch(() => null);

  const origin = {
    contactName: g?.originContactName ?? "",
    contactPhone: g?.originContactPhone ?? "",
    address: g?.originAddress ?? "",
    postalCode: g?.originPostalCode ?? "",
    areaId: g?.originAreaId ?? "",
  };
  const couriers = (g?.couriers ?? "jne,jnt,sicepat").trim();
  // Minimal yang dibutuhkan untuk MENGHITUNG ongkir: area asal + key.
  const ready = Boolean(apiKey && origin.areaId);

  return { apiKey, couriers, origin, ready };
}

export interface LoadedRateItems {
  rateItems: RateItem[];
  problems: string[];
}

/**
 * Ambil produk dari DB dan bangun item untuk perhitungan ongkir Biteship.
 * Berat & harga selalu dari DB — input klien hanya slug + kuantitas.
 */
export async function loadRateItems(
  payload: Payload,
  items: { slug: string; quantity: number }[],
  locale: Locale,
): Promise<LoadedRateItems> {
  const slugs = [...new Set(items.map((i) => i.slug))];
  const res = await payload.find({
    collection: "products",
    where: {
      and: [{ slug: { in: slugs } }, { status: { equals: "published" } }],
    },
    depth: 0,
    limit: slugs.length,
    locale,
  });
  const bySlug = new Map(res.docs.map((d: any) => [d.slug, d]));

  const rateItems: RateItem[] = [];
  const problems: string[] = [];
  for (const it of items) {
    const p: any = bySlug.get(it.slug);
    if (!p) {
      problems.push(`Produk "${it.slug}" tidak tersedia.`);
      continue;
    }
    const weight = typeof p.weightGrams === "number" ? p.weightGrams : 0;
    if (weight <= 0) {
      problems.push(
        `"${p.name}" belum punya berat — ongkir tak bisa dihitung.`,
      );
      continue;
    }
    rateItems.push({
      name: p.name,
      value: typeof p.price === "number" ? p.price : 0,
      weight,
      quantity: it.quantity,
    });
  }
  return { rateItems, problems };
}

/**
 * Buat order pengiriman Biteship untuk sebuah order yang sudah lunas, lalu
 * kembalikan hasilnya (termasuk nomor resi bila langsung terbit).
 *
 * Item diambil dari SNAPSHOT di order, bukan query produk lagi — order sudah
 * final. Melempar error bila konfigurasi/kurir tidak lengkap, supaya pemanggil
 * (webhook) bisa mencatatnya ke adminNotes tanpa menggagalkan pembayaran.
 */
export async function createShipmentForOrder(
  payload: Payload,
  apiKey: string | undefined,
  order: any,
): Promise<BiteshipOrderResult> {
  const config = await getShippingConfig(payload, apiKey);
  if (!apiKey) throw new Error("Biteship API key belum diisi.");
  if (!config.origin.areaId) throw new Error("Area gudang asal belum diisi.");

  const addr = order.shippingAddress ?? {};
  if (!addr.biteshipAreaId) throw new Error("Area tujuan order tidak ada.");
  const courierCompany = order.shipping?.courierCompany;
  const courierType = order.shipping?.courierType;
  if (!courierCompany || !courierType)
    throw new Error("Kurir order tidak lengkap.");

  const items: RateItem[] = (order.items ?? []).map((i: any) => ({
    name: i.nameSnapshot,
    value: i.unitPrice,
    weight: i.weightGrams,
    quantity: i.quantity,
  }));

  return createOrder(apiKey, {
    origin: {
      contactName: config.origin.contactName,
      contactPhone: config.origin.contactPhone,
      address: config.origin.address,
      postalCode: config.origin.postalCode,
      areaId: config.origin.areaId,
    },
    destination: {
      contactName: addr.recipientName,
      contactPhone: addr.phone,
      address: addr.addressLine,
      postalCode: addr.postalCode,
      areaId: addr.biteshipAreaId,
      note: addr.notes,
    },
    courierCompany,
    courierType,
    items,
    reference: order.orderNumber,
  });
}
