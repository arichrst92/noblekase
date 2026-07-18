/**
 * retrieve.ts — RAG sederhana: ambil produk paling relevan dari CMS
 * untuk dijadikan konteks jawaban chatbot.
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Pendekatan: keyword scoring (bukan embedding). Katalog Noblekase kecil
 * (belasan produk), jadi ini akurat, murah, dan tanpa infrastruktur vektor.
 * Bila katalog tumbuh besar, ganti bagian skor ini dengan embedding.
 */

import { getProducts, getCategories, type ProductWithSeo } from "@/lib/queries";
import { defaultLocale, localePath, type Locale } from "@/lib/i18n";

const STOPWORDS = new Set([
  "yang","untuk","dari","dan","atau","apa","apakah","ada","bisa","saya","aku","kamu",
  "ini","itu","dengan","di","ke","pada","buat","gimana","bagaimana","berapa","harga",
  "mau","ingin","cari","carikan","tolong","punya","kah","nya","the","for","a","is",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/** Skor relevansi produk terhadap pertanyaan. */
function scoreProduct(p: ProductWithSeo, tokens: string[]): number {
  const haystack = [
    p.name,
    p.tagline,
    p.category,
    p.subCategoryName ?? "",
    p.story,
    p.specs.map((s) => `${s.label} ${s.value}`).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (p.name.toLowerCase().includes(t)) score += 5;
    else if ((p.category + " " + (p.subCategoryName ?? "")).toLowerCase().includes(t)) score += 3;
    else if (haystack.includes(t)) score += 1;
  }
  return score;
}

/** Ringkas satu produk jadi teks padat untuk konteks LLM. */
function productToText(p: ProductWithSeo): string {
  const specs = p.specs.slice(0, 6).map((s) => `${s.label}: ${s.value}`).join("; ");
  const shops = p.marketplaces.map((m) => m.name).filter(Boolean).join(", ");
  return [
    `PRODUK: ${p.name}`,
    `Kategori: ${p.category}${p.subCategoryName ? ` / ${p.subCategoryName}` : ""}`,
    p.tagline && `Ringkasan: ${p.tagline}`,
    specs && `Spesifikasi: ${specs}`,
    shops && `Tersedia di: ${shops}`,
    `Tautan: /produk/detail/${p.slug}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface RetrievedContext {
  context: string;
  products: { name: string; slug: string }[];
}

/**
 * Ambil konteks untuk sebuah pertanyaan.
 * Selalu menyertakan daftar kategori agar bot bisa mengarahkan,
 * plus beberapa produk paling relevan.
 */
export async function retrieveContext(
  question: string,
  locale: Locale = defaultLocale,
  maxProducts = 5,
): Promise<RetrievedContext> {
  const [products, categories] = await Promise.all([getProducts(locale), getCategories(locale)]);
  const tokens = tokenize(question);

  const ranked = products
    .map((p) => ({ p, score: scoreProduct(p, tokens) }))
    .sort((a, b) => b.score - a.score);

  // Bila tak ada yang cocok, tetap beri beberapa produk sebagai gambaran.
  const hits = ranked.filter((r) => r.score > 0).slice(0, maxProducts);
  const chosen = (hits.length > 0 ? hits : ranked.slice(0, 3)).map((r) => r.p);

  // Tautan di konteks sudah diberi prefix bahasa, supaya jawaban bot tidak
  // melempar pembaca versi Inggris kembali ke halaman Indonesia.
  const categoryLine = `KATEGORI TERSEDIA: ${categories
    .map((c) => `${c.name} (${c.productCount}, ${localePath(locale, `/produk/${c.slug}`)})`)
    .join(" | ")}`;

  return {
    context: [categoryLine, "", ...chosen.map(productToText)].join("\n\n"),
    products: chosen.map((p) => ({ name: p.name, slug: p.slug })),
  };
}
