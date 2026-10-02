/**
 * Orders Collection — pesanan penjualan langsung (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Catatan desain:
 *   - Item disimpan sebagai SNAPSHOT (nama, harga, berat disalin saat order
 *     dibuat), bukan hanya relasi ke produk. Kalau harga/nama produk diubah
 *     nanti, riwayat order tetap mencerminkan kondisi saat pembelian.
 *   - Nilai uang disimpan sebagai BILANGAN BULAT Rupiah (tanpa desimal).
 *   - Field Xendit & Biteship sudah disiapkan sejak sekarang meski baru diisi
 *     di Fase 9.2/9.3 — supaya tidak perlu migrasi skema tambahan nanti.
 *   - Bukan `localized`: order adalah transaksi, bukan konten editorial.
 *
 * Akses: admin-only. Order dibuat oleh sistem lewat Local API dengan
 * `overrideAccess: true` (server-side), jadi publik tidak perlu akses tulis.
 */

import type { CollectionConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

/** Nomor order ramah-manusia, mis. NBK-20261002-7F3A. */
function generateOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  // 6 karakter acak (~2 miliar kombinasi) agar tabrakan sangat kecil; constraint
  // unique tetap menjaga, tapi tabrakan akan menggagalkan checkout satu pembeli.
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NBK-${ymd}-${rand}`;
}

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: [
      "orderNumber",
      "customerName",
      "total",
      "paymentStatus",
      "fulfillmentStatus",
      "createdAt",
    ],
    group: "Penjualan",
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Dibuat otomatis saat order dibuat.",
      },
    },

    // === STATUS (sidebar, untuk operasional cepat) ===
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Menunggu pembayaran", value: "pending" },
        { label: "Dibayar", value: "paid" },
        { label: "Kedaluwarsa", value: "expired" },
        { label: "Gagal", value: "failed" },
        { label: "Dikembalikan (refund)", value: "refunded" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "fulfillmentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Belum diproses", value: "pending" },
        { label: "Diproses", value: "processing" },
        { label: "Dikirim", value: "shipped" },
        { label: "Diterima", value: "delivered" },
        { label: "Dibatalkan", value: "cancelled" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      admin: {
        position: "sidebar",
        description:
          "Terisi bila pembeli memilih menyimpan akun. Boleh kosong (checkout tamu).",
      },
    },

    // === PEMBELI ===
    {
      name: "customerName",
      type: "text",
      required: true,
    },
    {
      name: "customerEmail",
      type: "email",
      required: true,
    },
    {
      name: "customerPhone",
      type: "text",
      required: true,
      admin: {
        description: "Nomor WhatsApp/HP aktif untuk konfirmasi & kurir.",
      },
    },

    // === ALAMAT KIRIM ===
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "recipientName", type: "text", required: true },
        { name: "phone", type: "text", required: true },
        {
          name: "addressLine",
          type: "textarea",
          required: true,
          admin: { description: "Nama jalan, nomor rumah, RT/RW, patokan." },
        },
        { name: "province", type: "text", required: true },
        { name: "city", type: "text", required: true },
        {
          name: "district",
          type: "text",
          admin: { description: "Kecamatan." },
        },
        { name: "postalCode", type: "text", required: true },
        {
          name: "biteshipAreaId",
          type: "text",
          admin: {
            description:
              "ID area Biteship hasil pemetaan alamat (diisi sistem di Fase 9.3).",
          },
        },
        {
          name: "notes",
          type: "textarea",
          admin: { description: "Catatan pengiriman dari pembeli (opsional)." },
        },
      ],
    },

    // === ITEM (snapshot) ===
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Item", plural: "Item Pesanan" },
      admin: {
        description:
          "Snapshot saat pembelian — tidak berubah meski produk diedit kemudian.",
      },
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          admin: {
            description:
              "Referensi produk (boleh tetap ada untuk tautan admin).",
          },
        },
        { name: "nameSnapshot", type: "text", required: true },
        { name: "skuSnapshot", type: "text" },
        {
          name: "unitPrice",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Harga satuan (Rupiah) saat dibeli." },
        },
        { name: "quantity", type: "number", required: true, min: 1 },
        {
          name: "weightGrams",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "Berat satuan (gram) saat dibeli." },
        },
        {
          name: "lineTotal",
          type: "number",
          required: true,
          min: 0,
          admin: { description: "unitPrice × quantity." },
        },
      ],
    },

    // === RINGKASAN BIAYA ===
    {
      name: "subtotal",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "Jumlah seluruh lineTotal (Rupiah)." },
    },
    {
      name: "shipping",
      type: "group",
      label: "Pengiriman",
      fields: [
        {
          name: "courierCompany",
          type: "text",
          admin: { description: "Mis. jne, jnt, sicepat (kode Biteship)." },
        },
        {
          name: "courierType",
          type: "text",
          admin: { description: "Mis. reg, yes, best." },
        },
        {
          name: "courierName",
          type: "text",
          admin: { description: "Nama tampil, mis. 'JNE Reguler'." },
        },
        {
          name: "cost",
          type: "number",
          defaultValue: 0,
          min: 0,
          admin: { description: "Ongkir (Rupiah)." },
        },
        {
          name: "etaText",
          type: "text",
          admin: { description: "Estimasi, mis. '2-3 hari'." },
        },
        {
          name: "totalWeightGrams",
          type: "number",
          min: 0,
          admin: { description: "Total berat kiriman (gram)." },
        },
        {
          name: "biteshipOrderId",
          type: "text",
          admin: {
            readOnly: true,
            description: "ID order Biteship (Fase 9.3).",
          },
        },
        {
          name: "waybillId",
          type: "text",
          admin: { description: "Nomor resi." },
        },
        {
          name: "trackingStatus",
          type: "text",
          admin: {
            readOnly: true,
            description: "Status tracking terakhir dari Biteship.",
          },
        },
      ],
    },
    {
      name: "total",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description:
          "subtotal + ongkir (Rupiah). Tanpa PPN (keputusan Sprint 9).",
      },
    },

    // === PEMBAYARAN (Xendit) ===
    {
      name: "payment",
      type: "group",
      label: "Pembayaran",
      fields: [
        {
          name: "method",
          type: "text",
          admin: {
            readOnly: true,
            description: "Metode yang dipakai pembeli di Xendit.",
          },
        },
        { name: "xenditInvoiceId", type: "text", admin: { readOnly: true } },
        {
          name: "xenditInvoiceUrl",
          type: "text",
          admin: { readOnly: true, description: "URL halaman bayar Xendit." },
        },
        { name: "paidAt", type: "date", admin: { readOnly: true } },
      ],
    },

    // === CATATAN INTERNAL ===
    {
      name: "adminNotes",
      type: "textarea",
      admin: { description: "Catatan internal, tidak tampil ke pembeli." },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && !data.orderNumber) {
          data.orderNumber = generateOrderNumber();
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        // Pulihkan stok saat order BERUBAH dari paid → refunded.
        //
        // Stok hanya pernah dikurangi ketika order menjadi "paid" (lihat webhook
        // Xendit), jadi pengembalian hanya relevan untuk transisi ini. Dijaga
        // ketat agar penyimpanan ulang order yang sudah refunded tidak menambah
        // stok berkali-kali.
        if (operation !== "update") return;
        const was = (previousDoc as { paymentStatus?: string })?.paymentStatus;
        const now = (doc as { paymentStatus?: string })?.paymentStatus;
        if (was === "paid" && now === "refunded") {
          const items =
            (doc as { items?: { product?: unknown; quantity?: number }[] })
              .items ?? [];
          for (const it of items) {
            const pid =
              it.product && typeof it.product === "object"
                ? (it.product as { id?: number | string }).id
                : it.product;
            if (pid == null || !it.quantity) continue;
            try {
              const p = await req.payload.findByID({
                collection: "products",
                id: pid as number,
                depth: 0,
                req,
              });
              const current =
                typeof (p as { stock?: number })?.stock === "number"
                  ? (p as { stock: number }).stock
                  : 0;
              await req.payload.update({
                collection: "products",
                id: pid as number,
                data: { stock: current + it.quantity },
                req,
                overrideAccess: true,
              });
            } catch {
              /* gagal-aman: jangan gagalkan penyimpanan order */
            }
          }
        }
      },
    ],
  },
};
