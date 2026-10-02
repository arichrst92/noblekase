/**
 * format.ts — formatter angka untuk tampilan.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 */

/**
 * Format Rupiah tanpa desimal, mis. 149000 → "Rp149.000".
 * Nilai disimpan sebagai bilangan bulat Rupiah di seluruh sistem.
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
