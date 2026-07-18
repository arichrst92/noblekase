# Noblekase — Roadmap Sprint Sisa Development

**Proyek:** Website katalog Noblekase (Next.js 15 + Payload CMS 3, self-hosted)
**Disusun oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))
**Tanggal:** 13 Juli 2026
**Model kerja:** Solo developer + dibantu Claude · Sprint 1 minggu · 9 sprint (~9 minggu)
**Perubahan arsitektur:** Storage upload = **local filesystem**. Catatan: koleksi `Media` **sudah** menyimpan ke disk lokal (`staticDir`) dan plugin Vercel Blob **tidak pernah dipasang** di `payload.config.ts` — jadi hanya perlu **membersihkan dependency Blob yang tidak terpakai** + mengatur persistensi produksi.

---

## Ringkasan Fase

| Fase | Fokus | Sprint | Status target |
|------|-------|--------|---------------|
| Fase 1 | Design system + frontend showcase + skema CMS | — | ✅ Selesai |
| Fase 2 | Sambungkan frontend ke CMS + konten asli → **katalog layak launch** | Sprint 0–4 | 🎯 MVP go-live |
| Fase 3 | Fitur AI + hardening + deploy | Sprint 5–8 | 🚀 Full feature |

**Milestone besar:**
- **M1 — Foundation siap** (akhir Sprint 0): DB jalan, types ter-generate, storage lokal, seed berhasil.
- **M2 — Katalog CMS-driven** (akhir Sprint 2): Produk & Journal tampil dari Payload, bukan sample-data.
- **M3 — MVP launch-ready** (akhir Sprint 4): Semua halaman dari CMS, konten asli, search jalan → **bisa go-live sebagai katalog**.
- **M4 — AI live** (akhir Sprint 6): Chatbot + market intel + blog draft + auto-translate aktif.
- **M5 — Production launch** (akhir Sprint 8): Deploy, hardening, UAT lolos.

---

## Sprint 0 — Foundation & Storage Lokal
**Goal:** Repo bisa `pnpm dev`, admin CMS bisa login, database & upload lokal berfungsi.

- [ ] `pnpm install` + verifikasi Node ≥ 20.9 / pnpm ≥ 9
- [ ] Setup PostgreSQL + Redis (Docker `compose up -d postgres redis` atau lokal)
- [ ] Copy `.env.example` → `.env.local`, isi `PAYLOAD_SECRET`, `DATABASE_URI`, `REDIS_URL`
- [ ] **Bersihkan storage ke local filesystem** (sebagian besar sudah lokal):
  - Hapus dependency `@payloadcms/storage-vercel-blob` dari `package.json` (terpasang tapi tidak dipakai di kode/config)
  - Konfirmasi koleksi `Media` sudah pakai `upload.staticDir` (saat ini `process.env.UPLOAD_DIR || "uploads"`) — **sudah lokal, tidak perlu ubah adapter**
  - Set env `UPLOAD_DIR` konsisten (mis. `./uploads` atau `public/media`)
  - Pastikan folder upload masuk `.gitignore` tapi ada `.gitkeep`
- [ ] Jalankan `pnpm generate:types` → hasilkan `src/payload-types.ts` (saat ini belum ada)
- [ ] Buat migration awal: `pnpm migrate:create` lalu `pnpm migrate` (folder `src/migrations` belum ada)
- [ ] **Buat seed script** `src/scripts/seed.ts` (dirujuk di `package.json` tapi file belum ada) — port isi `sample-data.ts` (34 produk, kategori, artikel, hero) ke koleksi Payload
- [ ] `pnpm seed` → verifikasi data masuk ke admin `/admin`
- [ ] Buat user admin pertama

**Definition of Done:** `/admin` login OK, upload gambar tersimpan di disk lokal & tampil, 34 produk terlihat di admin, `payload-types.ts` ter-commit.

---

## Sprint 1 — Integrasi CMS: Produk & Kategori
**Goal:** Halaman produk baca dari Payload, bukan `sample-data.ts`.
**Depends on:** Sprint 0

- [ ] Buat helper query Payload (`getPayload`) di server components (ganti import `sample-data`)
- [ ] Beranda (`page.tsx`) — hero, kategori, featured collection dari CMS
- [ ] Produk list (`produk/page.tsx`) + per-kategori (`produk/[category]/page.tsx`)
- [ ] Produk detail (`produk/detail/[slug]/page.tsx`) — galeri, spesifikasi, related products
- [ ] `ProductCard` & section components terima data Payload (sesuaikan tipe dari `payload-types.ts`)
- [ ] Hapus ketergantungan fungsi `getProductBySlug` / `getProductsByCategory` ke sample-data
- [ ] `generateStaticParams` untuk slug produk & kategori (SSG/ISR)

**Definition of Done:** Edit produk di admin → berubah di frontend. Tidak ada import `sample-data` di route produk.

---

## Sprint 2 — Integrasi CMS: Journal, Pages & Globals
**Goal:** Seluruh konten editorial & layout dari CMS. **→ Milestone M2**
**Depends on:** Sprint 1

- [ ] Journal list (`journal/page.tsx`) + detail (`journal/[slug]/page.tsx`) dari koleksi `Articles`
- [ ] Render rich text Lexical → HTML di artikel
- [ ] `ArticleCategories` untuk filter/nav journal
- [ ] Global `Header` & `Footer` → `TopNav` / `Footer` component baca dari CMS
- [ ] `SiteSettings` global → metadata, kontak, social links, marketplace links
- [ ] Halaman `Tentang` & `Dukungan`/FAQ dari koleksi `Pages` + `FAQItems`/`FAQCategories` (saat ini hardcoded)
- [ ] Hapus semua sisa import `sample-data` → arsipkan/hapus file

**Definition of Done:** Zero referensi `sample-data.ts` di seluruh `src/app/(frontend)`. Semua teks/link editable via admin.

---

## Sprint 3 — Search, Filter Dinamis & Media Pipeline
**Goal:** Fitur discovery berfungsi + pipeline gambar lokal rapi.
**Depends on:** Sprint 2

- [ ] Implementasi **search** (ikon di `TopNav` saat ini tanpa handler) — API route `/api/search` query Payload (nama produk, kategori, deskripsi)
- [ ] Halaman/overlay hasil search + state kosong
- [ ] **Filter produk dinamis** (`ProductFilterSidebar` saat ini statis) — filter by sub-kategori, harga, atribut; sinkron ke URL query params
- [ ] Sorting (harga, terbaru)
- [ ] Media: konfirmasi resize/format (Sharp) jalan di disk lokal; generate ukuran thumbnail
- [ ] Lazy-load & `next/image` config untuk path lokal

**Definition of Done:** Search mengembalikan produk relevan; filter mengubah hasil tanpa reload penuh; gambar teroptimasi.

---

## Sprint 4 — Konten Asli & SEO → MVP Launch-Ready
**Goal:** Ganti placeholder dengan konten produksi. **→ Milestone M3 (bisa go-live katalog)**
**Depends on:** Sprint 3

- [ ] Input **foto produk asli** (ganti 42 SVG placeholder) via admin
- [ ] Copywriting final: deskripsi produk, artikel journal, halaman Tentang, FAQ
- [ ] Harga & **link marketplace asli** (Tokopedia/Shopee/dll) per produk
- [ ] Logo & brand asset final (favicon, OG image)
- [ ] SEO: metadata dinamis per halaman, sitemap.xml, `robots.txt` (sudah ada), structured data (Product schema)
- [ ] Setup **Google Analytics 4** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)
- [ ] Aktifkan hook Google Indexing di `Products.ts` (saat ini TODO) — submit saat published
- [ ] Cache invalidation Next.js saat produk publish (TODO di `Products.ts`)

**Definition of Done:** Semua konten asli, tidak ada teks/gambar dummy, SEO metadata lengkap. **Katalog siap dilihat publik.**

---

## Sprint 5 — AI Chatbot (GROQ + RAG)
**Goal:** Chatbot bubble berfungsi penuh (saat ini UI kosong, TODO Phase 3).
**Depends on:** Sprint 4

- [ ] API route `/api/ai/chat` — koneksi GROQ (`llama-3.1-8b-instant`)
- [ ] **RAG**: retrieve konteks dari database produk untuk jawaban akurat
- [ ] Sambungkan `ChatbotBubble` ke endpoint (streaming response)
- [ ] Bottom sheet UI untuk mobile (TODO di komponen)
- [ ] Auto-bounce trigger (30 detik di Produk Detail tanpa klik CTA)
- [ ] Redis cache untuk AI response + rate limit (`RATE_LIMIT_AI_CHAT=20`)
- [ ] Budget cap: auto-disable saat `AI_BUDGET_CAP_USD` tercapai
- [ ] Feature flag `FEATURE_AI_CHATBOT` dihormati

**Definition of Done:** User tanya produk → chatbot jawab dari data asli; rate limit & budget cap aktif.

---

## Sprint 6 — AI Market Intel, Blog Draft & Auto-Translate
**Goal:** Sisa fitur AI (disebut di env, belum ada kode). **→ Milestone M4**
**Depends on:** Sprint 5

- [ ] **Market Intel** — endpoint + admin UI, model `llama-3.3-70b-versatile`, flag `FEATURE_AI_MARKET_INTEL`
- [ ] **Blog Draft AI** — generate draft artikel di admin, `FEATURE_AI_BLOG_DRAFT`
- [ ] **Auto-Translate** — terjemahan konten (next-intl sudah terpasang), `FEATURE_AI_AUTO_TRANSLATE`
- [ ] Shared: rate limit AI admin (`RATE_LIMIT_AI_ADMIN=10`), caching, budget tracking terpadu
- [ ] Guardrail biaya lintas semua fitur AI

**Definition of Done:** Ketiga fitur bisa di-toggle via flag & berfungsi di admin; total biaya AI termonitor.

---

## Sprint 7 — Hardening: Email, Cache, Rate Limit, Backup
**Goal:** Siap beban produksi & andal.
**Depends on:** Sprint 6

- [ ] **Resend email** — konfirmasi `RESEND_API_KEY`, `EMAIL_FROM`; template notifikasi
- [ ] Rate limiting publik & search (`RATE_LIMIT_PUBLIC=120`, `RATE_LIMIT_SEARCH=60`) via Redis
- [ ] Strategi cache Redis (produk, halaman, AI) + invalidation konsisten
- [ ] Verifikasi **backup script** (`backup.sh` / `backup-native.sh`) untuk Postgres **+ folder upload lokal** (penting sejak pindah dari Blob)
- [ ] Error handling & logging; halaman 404/500 rapi
- [ ] Audit keamanan: akses koleksi (`lib/access.ts`), env secrets, CORS

**Definition of Done:** Load test dasar lolos, backup DB+media terverifikasi restore, email terkirim.

---

## Sprint 8 — Deployment, UAT & Launch
**Goal:** Live di server. **→ Milestone M5**
**Depends on:** Sprint 7

**Jalur yang dipilih:** Docker Compose.

Konfigurasi (selesai):

- [x] Build standalone diaktifkan lewat `BUILD_STANDALONE` — sebelumnya Dockerfile dan `next.config.ts` saling bertentangan
- [x] `NEXT_PUBLIC_*` diteruskan sebagai build arg (Next menanamkannya saat build, bukan saat runtime)
- [x] `docker-compose.yml`: healthcheck app, batas ukuran log, volume log Caddy, catatan persistensi
- [x] `docker-compose.iponly.yml`: port 6000 → 8080 (6000 diblokir browser sebagai unsafe port)
- [x] Caddyfile: cache gambar diarahkan ke `/api/media/file/*` (pola `/uploads/*` lama tidak pernah cocok), `no-store` untuk `/admin`
- [x] `.env.example`: pemisahan `POSTGRES_*` vs `DATABASE_URI`, blok akun admin pertama
- [x] `DEPLOYMENT.md` ditulis ulang untuk alur Docker
- [x] `docs/UAT-CHECKLIST.md` — uji end-to-end dua bahasa + smoke test + rollback

Eksekusi (menunggu server):

- [ ] **Buat migrasi baru** — koleksi `Slides` dan perubahan lain setelah 13 Juli belum masuk migrasi; database produksi baru akan kekurangan tabel
- [ ] `pnpm build` bersih tanpa error
- [ ] Provision VPS, `docker compose up -d --build`
- [ ] Seed: `seed` → `seed:content` → `seed:translations`, lalu `create:admin`
- [ ] Domain + HTTPS via Caddy
- [ ] Verifikasi persistensi upload setelah rebuild container
- [ ] Isi env produksi (GROQ, Resend, Google) — atau lewat CMS → API Keys
- [ ] Google Search Console + submit sitemap
- [ ] **UAT** sesuai `docs/UAT-CHECKLIST.md` di staging
- [ ] Uji restore backup ke database kosong
- [ ] Smoke test pasca-deploy + monitoring uptime
- [ ] Go-live 🚀

**Definition of Done:** Domain produksi live, HTTPS aktif, upload persisten, semua fitur terverifikasi di production.

---

## Catatan Teknis: Migrasi Storage ke Local Filesystem

Kondisi aktual repo: penyimpanan file **sudah lokal**. Koleksi `Media` memakai `upload.staticDir` (`process.env.UPLOAD_DIR || "uploads"`) dan `payload.config.ts` **tidak** memasang plugin Vercel Blob. Jadi tidak ada migrasi adapter — hanya pembersihan & persistensi:

1. **Lepas paket Blob yang tidak terpakai** — hapus `@payloadcms/storage-vercel-blob` dari `dependencies`. Tidak ada plugin/kode yang merujuknya, jadi aman.
2. **Konfirmasi `staticDir`** — pastikan `UPLOAD_DIR` menunjuk lokasi yang diinginkan (mis. `./uploads` atau `public/media`). File tersimpan di disk server.
3. **Persistensi produksi** — jika pakai Docker, folder upload **wajib** di-mount sebagai volume agar tidak hilang saat container di-rebuild.
4. **Backup** — folder upload adalah bagian dari backup (karena di disk, bukan cloud). Pastikan `backup.sh` menyertakannya.
5. **Trade-off** — tidak ada CDN otomatis; pertimbangkan Caddy caching header atau CDN di depan bila trafik gambar tinggi.

---

## Ringkasan Timeline

| Sprint | Minggu | Milestone |
|--------|--------|-----------|
| 0 | Minggu 1 | M1 — Foundation siap |
| 1 | Minggu 2 | — |
| 2 | Minggu 3 | M2 — Katalog CMS-driven |
| 3 | Minggu 4 | — |
| 4 | Minggu 5 | **M3 — MVP launch-ready (katalog)** |
| 5 | Minggu 6 | — |
| 6 | Minggu 7 | M4 — AI live |
| 7 | Minggu 8 | — |
| 8 | Minggu 9 | **M5 — Production launch** |

> **Opsi launch cepat:** Jika ingin go-live lebih awal, katalog sudah bisa tayang setelah **Sprint 4 (Minggu 5)**. Fitur AI (Sprint 5–6) bisa menyusul pasca-launch tanpa mengganggu katalog.

---

*Dokumen ini disusun oleh PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia)).*
