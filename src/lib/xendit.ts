/**
 * xendit.ts — klien tipis Xendit Invoice API (Sprint 9, Fase 9.2).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY. Berisi secret key — jangan diimpor dari komponen client.
 *
 * Sengaja memakai `fetch` langsung, bukan SDK, supaya tidak menambah dependency
 * dan alurnya transparan. Hanya dua hal yang dibutuhkan di fase ini:
 *   1. createInvoice — membuat halaman bayar Xendit (data kartu di sisi Xendit,
 *      tidak pernah menyentuh server kita).
 *   2. verifyCallbackToken — membandingkan header 'x-callback-token' dari webhook
 *      dengan token verifikasi, memakai perbandingan waktu-konstan agar tidak
 *      bocor lewat timing attack. Tanpa verifikasi ini, siapa pun bisa mengirim
 *      callback palsu dan menandai order "lunas".
 */

import { createHmac, timingSafeEqual } from "crypto";

const XENDIT_API = "https://api.xendit.co";

export interface CreateInvoiceArgs {
  secretKey: string;
  /** ID unik milik kita — dipakai mencocokkan callback ke order (orderNumber). */
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  /** Masa berlaku invoice dalam detik (default 24 jam). */
  invoiceDuration?: number;
  items?: { name: string; quantity: number; price: number }[];
  customer?: { givenNames?: string; email?: string; mobileNumber?: string };
}

export interface XenditInvoice {
  id: string;
  invoiceUrl: string;
  status: string;
  externalId: string;
  amount: number;
}

export async function createInvoice(
  args: CreateInvoiceArgs,
): Promise<XenditInvoice> {
  // Basic auth: base64(secretKey + ":") — password kosong, sesuai spesifikasi Xendit.
  const auth = Buffer.from(`${args.secretKey}:`).toString("base64");

  const res = await fetch(`${XENDIT_API}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: args.externalId,
      amount: args.amount,
      currency: "IDR",
      payer_email: args.payerEmail,
      description: args.description,
      success_redirect_url: args.successRedirectUrl,
      failure_redirect_url: args.failureRedirectUrl,
      invoice_duration: args.invoiceDuration ?? 60 * 60 * 24,
      ...(args.items ? { items: args.items } : {}),
      ...(args.customer ? { customer: args.customer } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Xendit createInvoice gagal (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    invoice_url: string;
    status: string;
    external_id: string;
    amount: number;
  };

  return {
    id: data.id,
    invoiceUrl: data.invoice_url,
    status: data.status,
    externalId: data.external_id,
    amount: data.amount,
  };
}

/**
 * Bandingkan token callback dengan token verifikasi secara aman.
 * Keduanya di-hash dulu agar perbandingan panjang-tetap (timingSafeEqual
 * melempar bila panjang berbeda).
 */
export function verifyCallbackToken(
  received: string | null,
  expected: string | undefined,
): boolean {
  if (!received || !expected) return false;
  const a = createHmac("sha256", "nk").update(received).digest();
  const b = createHmac("sha256", "nk").update(expected).digest();
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
