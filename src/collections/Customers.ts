/**
 * Customers Collection — akun pelanggan OPSIONAL (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Checkout tetap bisa sebagai tamu. Akun hanya dibuat bila pembeli memilih
 * menyimpannya (biasanya ditawarkan setelah checkout), untuk melihat riwayat
 * pesanan dan menyimpan alamat.
 *
 * Ini collection auth TERPISAH dari `users` (admin CMS). Pelanggan login lewat
 * frontend; mereka tidak pernah bisa masuk panel admin karena `admin.user`
 * Payload tetap menunjuk ke `users`. Pembuatan akun dilakukan server-side saat
 * checkout dengan `overrideAccess: true`, jadi endpoint publik tidak perlu izin
 * tulis langsung ke collection ini.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

/** Admin CMS, atau pelanggan itu sendiri. */
const adminOrSelf = ({ req: { user } }: { req: { user: unknown } }) => {
  const u = user as {
    id?: string | number;
    role?: string;
    collection?: string;
  } | null;
  if (!u) return false;
  if (u.role === "superAdmin" || u.role === "contentEditor") return true;
  // Pelanggan hanya boleh dokumen miliknya sendiri.
  if (u.collection === "customers") return { id: { equals: u.id } };
  return false;
};

export const Customers: CollectionConfig = {
  slug: "customers",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 hari
    maxLoginAttempts: 5,
    lockTime: 1000 * 60 * 15,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "phone", "createdAt"],
    group: "Penjualan",
  },
  access: {
    read: adminOrSelf,
    create: isAdminOrEditor, // akun publik dibuat server-side via overrideAccess
    update: adminOrSelf,
    delete: isAdminOrEditor,
    // Jangan beri pelanggan akses panel admin.
    admin: () => false,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      type: "text",
      admin: { description: "Nomor WhatsApp/HP." },
    },
    {
      name: "addresses",
      type: "array",
      labels: { singular: "Alamat", plural: "Alamat Tersimpan" },
      admin: {
        description: "Alamat pengiriman tersimpan untuk checkout lebih cepat.",
      },
      fields: [
        {
          name: "label",
          type: "text",
          admin: { description: "Mis. 'Rumah', 'Kantor'." },
        },
        { name: "recipientName", type: "text", required: true },
        { name: "phone", type: "text", required: true },
        { name: "addressLine", type: "textarea", required: true },
        { name: "province", type: "text", required: true },
        { name: "city", type: "text", required: true },
        { name: "district", type: "text" },
        { name: "postalCode", type: "text", required: true },
        { name: "biteshipAreaId", type: "text" },
        { name: "isDefault", type: "checkbox", defaultValue: false },
      ],
    },
  ],
};
