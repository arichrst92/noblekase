/**
 * /api/account/register — buat akun pelanggan (opsional) (Sprint 9, revisi).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Collection `customers` membatasi create ke admin, jadi pendaftaran mandiri
 * lewat endpoint ini memakai overrideAccess server-side. Login dilakukan
 * terpisah lewat endpoint auth bawaan Payload (/api/customers/login).
 *
 * Catatan: ini hanya menyimpan nama + email + password. Riwayat pesanan
 * dicocokkan berdasarkan email order, jadi akun langsung "melihat" pesanan tamu
 * yang memakai email sama.
 */

import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { clientKey, rateLimit } from "@/lib/ai/rateLimit";

export async function POST(request: Request) {
  const rl = await rateLimit(clientKey(request, "account-register"), 10);
  if (!rl.allowed)
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });

  let body: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || !email || password.length < 8) {
    return NextResponse.json(
      {
        error: "validation",
        message: "Nama, email, dan password (min 8 karakter) wajib diisi.",
      },
      { status: 400 },
    );
  }

  const payload = await getPayloadClient();

  // Cegah bocoran: jawaban sama untuk email sudah terpakai.
  const existing = await payload.find({
    collection: "customers",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs.length) {
    return NextResponse.json(
      { error: "exists", message: "Email sudah terdaftar." },
      { status: 409 },
    );
  }

  try {
    await payload.create({
      collection: "customers",
      overrideAccess: true,
      data: { name, email, password, phone: body.phone } as Record<
        string,
        unknown
      > as never,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal buat akun:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
