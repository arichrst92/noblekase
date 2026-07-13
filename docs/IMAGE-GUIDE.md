# Noblekase — Panduan Gambar (Image Guide)

**Disusun oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

Referensi ukuran, aspect ratio, dan prompt image generator (ChatGPT / DALL·E) untuk setiap slot gambar di website. Panduan ringkas yang sama juga muncul otomatis sebagai hint di tiap field gambar di admin CMS.

## Cara kerja crop di CMS

Setiap gambar yang diupload ke koleksi **Media** otomatis dibuatkan beberapa varian aspect ratio (1:1, 4:3, 3:4, 16:9, 21:9, 1.91:1). Setelah upload:

1. Klik **Edit Image** pada gambar untuk membuka tool crop.
2. Geser **titik fokus (focal point)** ke bagian terpenting gambar — ini dipakai saat gambar dipotong otomatis ke tiap rasio.
3. Opsional: crop manual gambar dasar.

Upload gambar **sebesar/setinggi mungkin** dari rekomendasi (varian kecil di-generate otomatis, tidak sebaliknya).

## Mood brand (sertakan di setiap prompt)

> editorial-minimalist, warm natural lighting, banyak ruang negatif, palet cream (#FAF8F4) + charcoal (#1F1F1F) + aksen burnt sienna (#A0522D), gaya majalah, premium namun accessible — mood Bellroy / Muji / Native Union.

Teks di bawah sudah otomatis ditambahkan mood ini di CMS. Di dokumen ini, prompt ditulis ringkas — tambahkan kalimat mood di atas saat generate.

---

## Daftar slot gambar

| Lokasi (CMS) | Slot | Ukuran | Rasio | Prompt inti (ChatGPT) |
|---|---|---|---|---|
| Hero Editions → Image | Hero Beranda | 1600×900 | 16:9 | Wide editorial hero of phone accessories in a warm everyday setting (morning desk, sunlit), empty space on one side for headline |
| Beranda (Konten) → Brand Image | Section brand snippet | 900×1200 | 3:4 | Warm brand lifestyle photo of phone accessories arranged thoughtfully on a natural surface |
| Produk — Listing → Banner Image | Banner listing produk | 2100×900 | 21:9 | Wide editorial banner showing an assortment of phone accessories laid out neatly on a warm surface |
| Categories → Image | Kartu kategori | 800×600 | 4:3 | Tidy flat-lay of phone accessories representing this category on a warm cream surface |
| Categories → SEO OG Image | Share sosial kategori | 1200×630 | 1.91:1 | Hero banner of the category's accessories with brand wordmark space |
| Products → Main Image | Foto utama produk | 800×800 | 1:1 | Clean product photo of the accessory centered on warm cream background, soft shadow |
| Products → Gallery Image | Galeri (gallery) | 800×800 | 1:1 | Additional angle or detail close-up, consistent lighting with main photo |
| Products → Gallery Image | Galeri (lifestyle) | 900×1200 | 3:4 | Product in a real everyday context (desk, cafe, travel), lived-in and natural |
| Products → Story Image | Foto cerita produk | 900×1200 | 3:4 | The accessory in everyday context, natural light, magazine feel |
| Products → SEO OG Image | Share sosial produk | 1200×630 | 1.91:1 | The accessory as a wide social share banner with room for text |
| Articles → Hero Image | Cover & hero artikel | 1600×900 | 16:9 | Editorial cover illustrating the article topic about phone accessories / everyday tech |
| Articles → SEO OG Image | Share sosial artikel | 1200×630 | 1.91:1 | Wide social share banner for the article topic with space for a title |
| Pages → Hero block → Image | Hero halaman (mis. Tentang) | 1600×900 | 16:9 | Editorial brand scene fitting the page theme, warm, space for headline |
| Pages → Story block → Image | Pendamping section cerita | 900×1200 | 3:4 | Warm editorial photo supporting the story section, natural light, lived-in |
| Pages → SEO OG Image | Share sosial halaman | 1200×630 | 1.91:1 | Wide social share banner representing the page with room for a title |
| Dukungan (Konten) → Hero Image | Hero halaman Dukungan | 1600×900 | 16:9 | Friendly warm scene suggesting customer care, phone on a cafe table |
| Site Settings → Logo | Logo brand | tinggi 80px | — | **File brand asli** (jangan AI-generate) |
| Site Settings → Favicon | Favicon | 512×512 | 1:1 | **Monogram 'N'** brand asli, PNG transparan |
| Site Settings → Default OG Image | Share sosial default | 1200×630 | 1.91:1 | Branded social banner with accessories and wordmark space |
| Marketplaces → Icon | Logo marketplace | 64×64 | 1:1 | **Logo resmi marketplace** (jangan AI-generate) |

---

## Varian ukuran yang di-generate otomatis (koleksi Media)

| Nama varian | Ukuran | Rasio | Dipakai untuk |
|---|---|---|---|
| `thumbnail` | 400×400 | 1:1 | Thumbnail admin, kartu kecil |
| `square` | 800×800 | 1:1 | Foto utama produk |
| `landscape` | 800×600 | 4:3 | Kartu kategori, cover journal |
| `portrait` | 900×1200 | 3:4 | Lifestyle / story vertikal |
| `wide` | 1600×900 | 16:9 | Hero |
| `banner` | 2100×900 | 21:9 | Banner listing |
| `og` | 1200×630 | 1.91:1 | Open Graph / share sosial |

Semua varian: `fit: cover`, output **WebP** kualitas 85.

---

*Dokumen ini disusun oleh PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia)).*
