/**
 * ShippingSettings — pengaturan pengiriman (Sprint 9, Fase 9.3).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Berisi alamat GUDANG ASAL (titik hitung ongkir Biteship) dan daftar kurir
 * yang ditawarkan. Dipisah dari Integrations karena ini konfigurasi operasional
 * (boleh diubah editor), bukan kredensial rahasia.
 *
 * Akses dibatasi staf: alamat & telepon gudang tidak perlu terekspos publik.
 * Dibaca server-side lewat Local API (yang melewati access control), jadi
 * membatasi read di sini tidak mengganggu perhitungan ongkir.
 */

import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "@/lib/access";

export const ShippingSettings: GlobalConfig = {
  slug: "shipping-settings",
  label: "Pengaturan Pengiriman",
  admin: {
    group: "Penjualan",
    description:
      "Alamat gudang asal & kurir untuk perhitungan ongkir Biteship. Origin Area ID didapat dari pencarian area Biteship.",
  },
  access: {
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: "originContactName",
      type: "text",
      admin: { description: "Nama kontak pengirim (muncul di resi)." },
    },
    {
      name: "originContactPhone",
      type: "text",
      admin: { description: "Telepon pengirim." },
    },
    {
      name: "originAddress",
      type: "textarea",
      admin: { description: "Alamat gudang lengkap (jalan, nomor, patokan)." },
    },
    {
      name: "originPostalCode",
      type: "text",
      admin: { description: "Kode pos gudang." },
    },
    {
      name: "originAreaId",
      type: "text",
      admin: {
        description:
          "Area ID Biteship untuk gudang asal. Cari lewat pencarian area (mis. ketik kecamatan gudang di checkout untuk melihat formatnya), lalu salin ID-nya ke sini.",
      },
    },
    {
      name: "couriers",
      type: "text",
      defaultValue: "jne,jnt,sicepat,anteraja,pos,ninja",
      admin: {
        description:
          "Daftar kode kurir Biteship yang ditawarkan, dipisah koma. Mis. jne,jnt,sicepat,anteraja,pos,ninja.",
      },
    },
  ],
};
