/**
 * imageGuidance.ts — helper untuk hint gambar di admin CMS
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menghasilkan teks admin.description standar berisi:
 *  - Rekomendasi ukuran & aspect ratio
 *  - Ukuran variant yang di-generate otomatis
 *  - Prompt siap-tempel untuk ChatGPT / DALL·E image generator
 *
 * Mood brand (selalu sertakan di prompt): mengikuti packaging Noblekase —
 * bersih & bold, background putih, aksen oranye (#F15A24) + navy (#1B2A63),
 * gaya consumer-electronics retail modern, high-contrast, premium namun accessible.
 */

export const BRAND_MOOD =
  "clean and bold, crisp white background, vivid orange (#F15A24) and deep navy (#1B2A63) brand accents, " +
  "high-contrast, modern consumer-electronics retail photography, sharp product focus, " +
  "energetic yet premium, bright even lighting";

export function imgHint(opts: {
  slot: string; // deskripsi slot, mis. "Foto utama produk"
  size: string; // rekomendasi px, mis. "1600×900"
  ratio: string; // aspect ratio, mis. "16:9"
  prompt: string; // isi spesifik prompt (tanpa mood — mood ditambah otomatis)
}): string {
  return (
    `${opts.slot}. Rekomendasi: ${opts.size}px (rasio ${opts.ratio}), format JPG/PNG/WebP. ` +
    `Setelah upload, atur titik fokus/crop via "Edit Image". ` +
    `\n\nPrompt ChatGPT (image generator): "${opts.prompt}, ${BRAND_MOOD}. Aspect ratio ${opts.ratio}."`
  );
}
