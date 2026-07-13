/**
 * imageGuidance.ts — helper untuk hint gambar di admin CMS
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Menghasilkan teks admin.description standar berisi:
 *  - Rekomendasi ukuran & aspect ratio
 *  - Ukuran variant yang di-generate otomatis
 *  - Prompt siap-tempel untuk ChatGPT / DALL·E image generator
 *
 * Mood brand (selalu sertakan di prompt): editorial-minimalist, warm natural
 * lighting, banyak ruang negatif, palet cream (#FAF8F4) + charcoal (#1F1F1F)
 * + aksen burnt sienna (#A0522D), gaya majalah, referensi Bellroy/Muji/Native Union.
 */

const BRAND_MOOD =
  "editorial-minimalist, warm natural lighting, lots of negative space, " +
  "cream (#FAF8F4) and soft charcoal palette with subtle burnt-sienna accents, " +
  "magazine-style, clean, premium yet accessible, in the mood of Bellroy / Muji / Native Union";

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
