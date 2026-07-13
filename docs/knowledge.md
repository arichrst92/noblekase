# Noblekase Website — Knowledge Document

> Dokumen ringkasan komprehensif berisi seluruh keputusan konsep, desain, dan teknis yang telah disepakati.

**Klien:** Noblekase (brand aksesoris HP)
**Tanggal:** Mei 2026
**Disusun oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

---

## 1. Brand Positioning

### Core Statement
> "Aksesoris yang menemani hari-hari setiap orang."

### Strategi
- **Positioning:** Value-for-everyone
- **Esensi:** Kualitas konsisten, harga kompetitif, desain bersih—tanpa segmentasi premium/ekonomis
- **Diferensiasi:** Visual editorial-minimalist untuk brand value (jarang dilakukan kompetitor); brand value bertampilan premium
- **Referensi mood:** Bellroy, Muji, Native Union (versi accessible)

### Tiga Pilar
1. **Quality without Compromise** — kualitas konsisten untuk semua produk
2. **Stories of Everyday Use** — storytelling/lifestyle, bukan fitur kering
3. **Universal yet Personal** — untuk semua orang, namun terasa dekat

---

## 2. Visual Identity

### Color Palette
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background utama | Off-white warm | `#FAF8F4` | Body background |
| Text primary | Charcoal soft | `#1F1F1F` | Headlines, body text |
| Text secondary | Mid gray | `#6B6862` | Sub-text, captions |
| Accent | Burnt Sienna | `#A0522D` | CTA, accent details |
| Border light | Cream gray | `#E8E2D6` | Dividers, card borders |
| Surface | Warm cream | `#F2EDE3` | Section background variation |

### Typography
- **Headlines:** Fraunces (serif) — kombinasi alternatif: Recoleta, Editor
- **Body:** Inter (sans) — kombinasi alternatif: Manrope
- **Sentence case** untuk semua teks (tidak ada ALL CAPS, tidak ada Title Case)
- **Eyebrow text:** uppercase + letter-spacing 2px, ukuran kecil

### Photography Direction
- Foto produk dalam *contextual environment* (bukan packshot studio putih)
- Banyak ruang negatif, natural lighting
- Setting: meja kerja, kafe, perjalanan, dashboard mobil, rumah
- Mood: warm, lived-in, magazine-style

---

## 3. Sitemap

### Customer Website
```
Beranda
Produk
├── Charger & Power
│   ├── Wall Charger
│   ├── Car Charger
│   ├── Wireless Charger
│   └── Power Bank
├── Kabel & Konektor
│   ├── USB-C
│   ├── Lightning
│   ├── Multi-port
│   └── Adapter
├── Holder, Stand & Mount
│   ├── Car Holder
│   ├── Desk Stand
│   └── Magnetic Mount
└── Audio & Casing
    ├── Earphone & TWS
    ├── Speaker
    ├── Casing
    └── Screen Protector
Produk Detail (per produk)
Tentang
Journal (Blog)
├── Cerita
├── Panduan
└── Edukasi
Kontak (channel-only)
Dukungan (FAQ)
```

### CMS
```
Dashboard
Management Produk
├── Daftar Produk
├── Tambah/Edit Produk (+ AI Market Intelligence)
└── Kategori & Filter Setup
Management Content
├── Halaman Statis (Beranda hero, Tentang, dll)
├── Featured Collection
└── Marketplace Channels Setup
Management Blog/Journal
├── Daftar Artikel
├── Editor (+ AI Draft Generator)
└── Kategori
SEO Optimizer
├── Meta tags per halaman
├── Schema markup
├── XML Sitemap
└── Saran perbaikan
Google Index Reports
├── Status indexing
├── URL submission
└── Coverage report
Google Analytics
└── Embedded dashboard
Management Akses
├── User & Role
└── Permissions
Settings
├── Brand identity
├── Marketplace links
├── Social media
├── Bahasa
└── Chatbot config
```

---

## 4. Pages — Layout Decisions

### Beranda
- **Pattern:** Hybrid Story + Quick Access
- **Sections:** Hero editorial → Pilih Kategori (4 cards) → Cerita Edisi Ini → Tentang Noblekase snippet → Dari Journal → Marketplace CTA → Footer
- **Hero style:** Static editorial (1 narrative per "edisi" bulanan, configurable via CMS)
- **Section names:** "Pilih Kategori", "Cerita Edisi Ini", "Tentang Noblekase", "Dari Journal", "Dapatkan Di"

### Produk Listing
- **Desktop:** 3-column grid + sticky filter sidebar (Sub-kategori, Daya, Fitur, Harga, Marketplace)
- **Mobile:** 2-column grid + filter bottom-sheet drawer
- **Product card:** image, optional badge (NEW/BEST), eyebrow kategori, nama, tagline, marketplace icons (T/S/TT/L)
- **NO price displayed** — fokus brand+produk, harga di marketplace masing-masing
- **Filter groups configurable per kategori** via CMS

### Produk Detail
- **Desktop:** Sticky image gallery (kiri) + scrolling info (kanan)
- **Mobile:** Full-bleed swipeable carousel + sticky bottom CTA bar (Beli ▾ + WhatsApp)
- **Sections:** Hero (gallery+info) → Cerita Produk → Detail Teknis → Foto Situasional → Produk Terkait
- **Marketplace cards:** menampilkan status (Toko Resmi, Mall) + benefit (Free Ongkir, Cashback); primary marketplace highlighted
- **Secondary actions:** WhatsApp consult + Share

### Tentang
- **Sections:** Hero centered statement → Filosofi (3 pilar dengan ikon) → Cerita asal mula (split layout) → Komitmen Kualitas (4 numbered items) → CTA closing
- **Layout:** Mostly centered, generous white space

### Journal Listing
- **Desktop:** Header + category tabs (Semua, Cerita, Panduan, Edukasi) + featured article (split) + grid 3-kolom + pagination
- **Magazine-style** dengan reading time per article

### Journal Detail
- **Single-column reading width:** 640px max (optimal readability)
- **Sections:** Header centered (kategori pill, judul, intro, author+date) → Hero image full-bleed → Body artikel → "Produk yang Dibahas" (inline) → Baca Juga (related)

### Kontak
- **Pattern:** Channel-only (tidak ada formulir kontak)
- **Channels:** AI Assistant chatbot (primary) → WhatsApp CS → Social Media (Instagram, TikTok, Facebook) → Email partnership
- **CTA closing:** Kembali ke Produk

### Dukungan
- **Sections:** Search bar + 4 kategori bantuan + FAQ accordion + escalation (AI Assistant + WhatsApp)
- **No contact form** — eskalasi langsung ke channel komunikasi

---

## 5. Navigation & Interaction

### Top Navigation
- **Style:** Rounded floating pill (margin from edge, sticky on scroll)
- **Menu:** Beranda · Produk · Tentang · Journal · Dukungan
- **Right-side:** Toggle ID/EN, ikon search
- **Mobile:** Hamburger kiri, logo tengah, search/share kanan

### Mobile Bottom Navigation
- **Style:** Rounded floating pill (margin from edge)
- **5 slots:** Beranda · Produk · [N logo center] · Journal · Lainnya
- **Center button:** Logo bulat sebagai signature touch (action: scroll-to-top atau quick search)
- **"Lainnya"** membuka drawer/sheet: Tentang, Dukungan, Kontak, Toggle Bahasa

### Chatbot Placement
- **Floating bubble** pojok kanan-bawah di semua halaman customer
- **Visual:** Lingkaran 48-52px, charcoal solid, ikon halus
- **Smart trigger:** Auto-bounce setelah 30+ detik di Produk Detail tanpa klik CTA
- **Mobile adjustment:** Posisi disesuaikan agar tidak menumpuk dengan sticky CTA bar
- **Halaman Kontak:** AI Assistant ditampilkan prominent sebagai opsi utama
- **Knowledge scope:** Hanya produk Noblekase, FAQ, kebijakan, info kontak. Out-of-scope → polite redirect

---

## 6. Scroll Behavior & Animation

### Pattern: Hybrid Cinematic + Continuous
- **Hero & Featured Collection:** Full viewport (100vh), snap soft, animasi reveal cinematic
- **Section lain (Categories, Brand Story, Journal, Marketplace, Footer):** Continuous flow tanpa snap
- **Mobile:** Selalu continuous flow (no fullpage snap, mobile-friendly performance)

### Animation Intensity: Subtle & Elegant
- Fade + slide kecil (8-15px)
- Parallax halus pada hero image
- Durasi 600-800ms
- Reveal stagger 80ms pada multi-card sections
- **Library:** GSAP + ScrollTrigger

### Contoh Per Section
- **Hero:** image bergeser ~15% lebih lambat dari teks saat scroll
- **Pilih Kategori:** kartu reveal stagger satu per satu
- **Cerita Edisi:** foto besar masuk dengan scale 1.05 → 1
- **Brand Story:** parallax background image halus
- **Journal:** kartu reveal dari bawah saat masuk viewport

---

## 7. CMS Architecture

### User Roles (3 role)
1. **Super Admin** — Full access semua modul + Settings + Akses Manajemen
2. **Content Editor** — CRUD content (produk deskripsi, blog, halaman statis); tidak bisa hapus user atau ubah struktur produk
3. **SEO/Marketing Analyst** — Read-only SEO Reports + Google Index + Analytics; bisa edit meta tags & schema per halaman/produk

### AI Features

**AI Market Intelligence (di Product Management)**
- Saat tambah/edit produk, panel AI menampilkan:
  - Analisis kompetitor produk serupa (Anker, Robot, Aukey)
  - Range harga pasar dan posisi Noblekase
  - Saran keyword SEO trending
  - Saran angle storytelling untuk konten produk
- **Trigger:** On-demand via tombol "Analyze" (bukan real-time, untuk hemat biaya)

**AI Blog Draft Generator**
- Mode disepakati: **Draft AI + Manual Review**
- AI generate draft berdasarkan topik/keyword input
- Admin review, edit, dan approve sebelum publish
- AI bisa bantu auto-translate ke bahasa kedua (ID ↔ EN)

### CMS Theme
- Belum diputuskan final (utility-focused vs editorial-consistent vs hybrid)
- Akan dibahas saat fase teknis

---

## 8. Bahasa & Lokalisasi

- **Default:** Bahasa Indonesia
- **Toggle:** EN tersedia di header
- **Setiap entitas** (produk, blog, halaman) punya field `id` dan `en`
- **AI auto-translate** untuk draft, admin review final

---

## 9. SEO & Google Integration

### SEO Optimizer (CMS)
- Auto-generate meta description, title, schema.org markup per halaman
- Submit URL baru ke Google via Indexing API saat publish
- Monitor index status via Search Console API
- Saran perbaikan: alt text kosong, judul terlalu panjang, dll

### Google Analytics
- Embedded dashboard di CMS
- Tracking standar: pageviews, sessions, conversion event ke marketplace, bounce rate

---

## 10. Marketplace Integration

### Channel Targets (CTA)
- Tokopedia (Toko Resmi)
- Shopee (Mall)
- TikTok Shop
- Lazada (LazMall)

### Per-Product Marketplace Card
- Status & benefit ditampilkan per marketplace
- Primary CTA (button hitam solid) untuk marketplace utama (mis. Tokopedia Toko Resmi)
- Outline button untuk marketplace lain
- Configurable per-produk via CMS

### WhatsApp
- **Bukan primary CTA**—untuk konsultasi, klaim garansi, B2B/reseller
- Tombol secondary di Produk Detail
- Channel utama di halaman Kontak (setelah AI Assistant)

---

## 11. Technical Architecture Decisions

### 11.1 Tech Stack
| Layer | Pilihan | Versi |
|---|---|---|
| Frontend | Next.js (App Router) | 14+ |
| Styling | Tailwind CSS + shadcn/ui | latest |
| Animation | GSAP + ScrollTrigger | latest |
| CMS | Payload CMS (TypeScript) | 3.0 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Image Optimization | Sharp + Next/Image (self-host) | latest |
| AI Provider | **Groq API** | — |
| Search | PostgreSQL Full-Text Search | built-in |
| Reverse Proxy | Caddy | 2 |
| Container | Docker + Docker Compose | latest |
| Email | Resend API | — |
| Backup Storage | Cloudflare R2 (free 10GB) | — |
| Monitoring | Uptime Kuma (self-hosted) | — |

### 11.2 Infrastructure
- **VPS spec:** 2-4 vCPU, 4-8 GB RAM (klien sudah punya)
- **Domain:** Sudah punya (belum pointing ke VPS — perlu update A record)
- **SSL:** Let's Encrypt via Caddy (auto-renewal)
- **Deployment:** Docker Compose, auto-deploy via GitHub Actions/webhook
- **Staging:** TIDAK ada — langsung production. Pakai feature flags untuk eksperimental.

### 11.3 AI Strategy (Groq)
- **Chatbot:** Llama 3.1 8B Instant — fast, cheap, scope sederhana cukup
- **Market Intelligence:** Llama 3.3 70B Versatile — analisis lebih dalam
- **Blog Generator:** Llama 3.3 70B Versatile — output panjang dan nuanced
- **Auto-translate:** Llama 3.3 70B Versatile (ID ↔ EN)
- API: OpenAI-compatible, easy integration

### 11.4 Authentication
- **CMS:** Built-in Payload auth (email + password)
- **Reset password:** Via email (Resend)
- **Roles:** 3 (Super Admin, Content Editor, SEO Analyst)

### 11.5 Image Storage
- **Strategy:** Self-host di VPS volume `/data/uploads`
- **Optimization:** Sharp via Next/Image (auto WebP, multiple sizes, lazy loading)
- **Estimated disk usage:** ~5-10 GB untuk 200 produk × 5-7 foto + thumbnails

### 11.6 Backup & DR
- **Frequency:** Nightly pg_dump cron + uploads tar
- **Storage:** Cloudflare R2 (free 10GB)
- **Retention:** 7 daily + 4 weekly + 12 monthly
- **Test restore:** Setiap 3 bulan
- **RTO target:** 2 jam (recovery time objective)
- **RPO target:** 24 jam (recovery point objective — last backup)

### 11.7 Cost Estimation (Monthly OpEx)
| Item | Biaya |
|---|---|
| VPS (existing) | — |
| Domain (existing) | — |
| Cloudflare R2 backup | $0 (free 10GB) |
| Resend email | $0 (free 3K/bulan) |
| Groq AI | $0-30 (free tier → light usage) |
| **Total** | **~$5-30/bulan (Rp 75K-450K)** |

### 11.8 Timeline
- **Approach:** Launch lengkap sekaligus (semua fitur termasuk AI)
- **Estimated:** 12-16 minggu (~3-4 bulan)
- **Phases:** Infrastructure (1-2w) → CMS+Frontend (5-7w) → AI (2-3w) → SEO+Google (1-2w) → Testing+Launch (2-3w)

---

## 12. Status Document

| Phase | Status | Output |
|-------|--------|--------|
| Diskusi Konsep | ✅ Selesai | Knowledge poin 1-3 |
| Diskusi Wireframe | ✅ Selesai | 8 halaman customer-side (desktop+mobile) |
| Dokumen Concept & Wireframe | ✅ Selesai | `noblekase-presentation.html` |
| Diskusi Arsitektur Teknis | ✅ Selesai | Knowledge poin 11 |
| Dokumen Technical Specification | ✅ Selesai | `noblekase-technical-spec.html` |
| Implementasi (Fase 1-5) | ⏳ Pending | Rencana 12-16 minggu |

---

*Dibuat oleh: PT Solusi Inovasi Bangsa — [https://ide.asia](https://ide.asia)*
