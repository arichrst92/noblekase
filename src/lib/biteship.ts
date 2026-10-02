/**
 * biteship.ts — klien tipis Biteship (Sprint 9, Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY. Berisi API key.
 *
 * Tiga kebutuhan:
 *   1. searchAreas — ubah ketikan alamat jadi "area id" Biteship (dipakai
 *      autocomplete tujuan + menentukan area gudang asal).
 *   2. getRates — hitung ongkir real-time multi-kurir berdasarkan berat.
 *   3. createOrder — buat order kirim + terbitkan resi setelah pembayaran lunas.
 *
 * Catatan: nama field di bawah mengikuti bentuk umum API Biteship. Bila akun
 * Anda mengembalikan bentuk sedikit berbeda, sesuaikan di satu tempat ini saja.
 */

const BITESHIP_API = "https://api.biteship.com";

function headers(apiKey: string) {
  // Biteship menerima API key langsung di header Authorization.
  return { Authorization: apiKey, "Content-Type": "application/json" };
}

export interface BiteshipArea {
  id: string;
  name: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
}

export async function searchAreas(
  apiKey: string,
  input: string,
): Promise<BiteshipArea[]> {
  const url = `${BITESHIP_API}/v1/maps/areas?countries=ID&type=single&input=${encodeURIComponent(input)}`;
  const res = await fetch(url, { headers: headers(apiKey) });
  if (!res.ok) throw new Error(`Biteship areas gagal (${res.status})`);
  const data = (await res.json()) as { areas?: any[] };
  return (data.areas ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    province: a.administrative_division_level_1_name ?? "",
    city: a.administrative_division_level_2_name ?? "",
    district: a.administrative_division_level_3_name ?? "",
    postalCode: a.postal_code ? String(a.postal_code) : "",
  }));
}

export interface RateItem {
  name: string;
  value: number; // untuk asuransi
  weight: number; // gram
  quantity: number;
}

export interface ShippingRate {
  courierCompany: string; // courier_code, mis. "jne"
  courierType: string; // courier_service_code, mis. "reg"
  courierName: string; // mis. "JNE"
  serviceName: string; // mis. "Reguler"
  price: number;
  etaText: string;
}

export async function getRates(
  apiKey: string,
  args: {
    originAreaId: string;
    destinationAreaId: string;
    couriers: string;
    items: RateItem[];
  },
): Promise<ShippingRate[]> {
  const res = await fetch(`${BITESHIP_API}/v1/rates/couriers`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      origin_area_id: args.originAreaId,
      destination_area_id: args.destinationAreaId,
      couriers: args.couriers,
      items: args.items,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Biteship rates gagal (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { pricing?: any[] };
  return (data.pricing ?? []).map((p) => ({
    courierCompany: p.courier_code,
    courierType: p.courier_service_code,
    courierName: p.courier_name ?? p.courier_code,
    serviceName: p.courier_service_name ?? p.service ?? "",
    price: Number(p.price) || 0,
    etaText:
      p.shipment_duration_range && p.shipment_duration_unit
        ? `${p.shipment_duration_range} ${p.shipment_duration_unit}`
        : (p.duration ?? ""),
  }));
}

export interface CreateBiteshipOrderArgs {
  origin: {
    contactName: string;
    contactPhone: string;
    address: string;
    postalCode: string;
    areaId: string;
  };
  destination: {
    contactName: string;
    contactPhone: string;
    address: string;
    postalCode: string;
    areaId: string;
    note?: string;
  };
  courierCompany: string;
  courierType: string;
  items: RateItem[];
  reference: string; // orderNumber
}

export interface BiteshipOrderResult {
  id: string;
  waybillId?: string;
  trackingId?: string;
  status?: string;
}

export async function createOrder(
  apiKey: string,
  args: CreateBiteshipOrderArgs,
): Promise<BiteshipOrderResult> {
  const res = await fetch(`${BITESHIP_API}/v1/orders`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      origin_contact_name: args.origin.contactName,
      origin_contact_phone: args.origin.contactPhone,
      origin_address: args.origin.address,
      origin_postal_code: args.origin.postalCode,
      origin_area_id: args.origin.areaId,
      destination_contact_name: args.destination.contactName,
      destination_contact_phone: args.destination.contactPhone,
      destination_address: args.destination.address,
      destination_postal_code: args.destination.postalCode,
      destination_area_id: args.destination.areaId,
      destination_note: args.destination.note ?? "",
      courier_company: args.courierCompany,
      courier_type: args.courierType,
      delivery_type: "now",
      reference_id: args.reference,
      items: args.items,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Biteship createOrder gagal (${res.status}): ${text}`);
  }
  const data = (await res.json()) as any;
  return {
    id: data.id,
    waybillId: data.courier?.waybill_id ?? undefined,
    trackingId: data.courier?.tracking_id ?? undefined,
    status: data.status ?? undefined,
  };
}
