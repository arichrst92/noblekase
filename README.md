# Noblekase

Website katalog brand aksesoris HP — Next.js 15 + Payload CMS 3.0, self-hosted.

> **Konsep:** Aksesoris yang menemani hari-hari setiap orang. Brand value-for-everyone dengan visual editorial-minimalist.

**Dibuat oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20.9.0 atau ≥ 22 (recommended: 22 LTS)
- **pnpm** ≥ 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **PostgreSQL** 16+ (atau pakai Docker)
- **Redis** 7+ (atau pakai Docker)
- **Docker** + **Docker Compose** (untuk production deployment)

### Setup Lokal

```bash
# 1. Clone repo
git clone <repo-url> noblekase && cd noblekase

# 2. Install dependencies
pnpm install

# 3. Copy env file dan isi values
cp .env.example .env.local
# Edit .env.local — set GROQ_API_KEY, RESEND_API_KEY, dll.

# 4. Start PostgreSQL + Redis (atau pakai instance lokal)
docker compose up -d postgres redis

# 5. Run dev server
pnpm dev
```

Akses:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin CMS**: [http://localhost:3000/admin](http://localhost:3000/admin)

User pertama kali login: buat via admin panel saat first run.

---

## Struktur Folder

```
app/
├── src/
│   ├── app/
│   │   ├── (frontend)/      ← Customer site (Next.js routes)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx     ← Beranda
│   │   │   └── globals.css
│   │   └── (payload)/       ← Payload CMS routes
│   │       ├── admin/[[...segments]]/
│   │       └── api/
│   ├── collections/         ← Payload collections (Products, Articles, dll)
│   ├── globals/             ← Payload globals (SiteSettings, Header, Footer)
│   ├── components/
│   │   ├── layout/          ← TopNav, Footer, BottomNavMobile
│   │   ├── sections/        ← HeroSection, CategoryGrid, FeaturedCollection, dll
│   │   ├── animation/       ← RevealOnScroll (GSAP)
│   │   └── chatbot/         ← ChatbotBubble
│   ├── lib/                 ← Utility functions (cn, access, dll)
│   └── payload.config.ts    ← Payload main config
├── public/                  ← Static assets
├── uploads/                 ← User-uploaded media (gitignored)
├── docker-compose.yml       ← Production deployment
├── Dockerfile               ← Multi-stage build
├── Caddyfile                ← Reverse proxy + SSL config
├── scripts/
│   └── backup.sh            ← Nightly backup ke Cloudflare R2
└── package.json
```

---

## Commands

| Command | Deskripsi |
|---|---|
| `pnpm dev` | Start dev server (Next.js + Payload) di :3000 |
| `pnpm devsafe` | Clear `.next` cache lalu dev |
| `pnpm build` | Production build |
| `pnpm start` | Run production build lokal |
| `pnpm lint` | Lint kode dengan ESLint |
| `pnpm format` | Format kode dengan Prettier |
| `pnpm payload` | Akses Payload CLI |
| `pnpm generate:types` | Generate TypeScript types dari Payload schema |
| `pnpm generate:importmap` | Regenerate Payload import map (wajib setelah tambah collection) |
| `pnpm migrate` | Run database migrations |
| `pnpm migrate:create` | Buat migration baru |
| `pnpm seed` | Run seed script (bila ada) |

---

## Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS 3.4 + shadcn/ui pattern |
| Animation | GSAP + ScrollTrigger |
| CMS | Payload 3.0 (TypeScript-first) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | Groq API (Llama 3.1 8B + 3.3 70B) |
| Email | Resend |
| Image | Sharp + Next/Image |
| Deployment | Docker Compose + Caddy (auto-SSL) |
| Backup | Cloudflare R2 |

Stack penuh + alasannya ada di `noblekase-technical-spec.html` (root parent folder).

---

## Brand Colors

```ts
{
  bg: {
    base: "#FAF8F4",  // Off-white warm
    warm: "#F2EDE3",  // Light cream
    cream: "#ECE5D7", // Section backgrounds
  },
  ink: {
    primary: "#1F1F1F",   // Headlines, body text
    secondary: "#6B6862", // Sub-text, captions
    tertiary: "#A09B91",  // Hints, eyebrow
  },
  accent: {
    DEFAULT: "#A0522D",   // Burnt sienna — CTA, highlights
    light: "#D4A88A",     // Lighter accent
    soft: "#FAEEDA",      // Soft background variant
  },
  border: {
    light: "#E8E2D6",
    mid: "#D4CEC0",
  },
}
```

Typography: **Fraunces** (serif headings) + **Inter** (sans body).

---

## Environment Variables

Semua variable yang dibutuhkan ada di `.env.example`. Required minimal untuk dev:
- `PAYLOAD_SECRET` — JWT secret (generate via `openssl rand -base64 32`)
- `DATABASE_URI` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `NEXT_PUBLIC_SITE_URL` — Base URL site

Optional untuk full functionality:
- `GROQ_API_KEY` — untuk fitur AI (chatbot, market intel, blog draft)
- `RESEND_API_KEY` — untuk email notification CMS
- `GOOGLE_INDEXING_SERVICE_ACCOUNT_PATH` — untuk auto-submit URL ke Google
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Google Analytics 4

---

## Production Deployment

### 1. Setup VPS

```bash
# Ubuntu 22.04 LTS / Debian 12
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo apt install docker-compose-plugin -y
sudo usermod -aG docker $USER

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Deploy

```bash
# Clone & setup
mkdir -p /opt/noblekase && cd /opt/noblekase
git clone <repo-url> .

# Setup env
cp .env.example .env
# Edit .env dengan production values

# Edit Caddyfile untuk domain Anda
sed -i 's/noblekase.co.id/yourdomain.com/g' Caddyfile

# Build & run
docker compose up -d --build

# Cek logs
docker compose logs -f
```

### 3. Setup Backup Cron

```bash
# Make script executable
chmod +x scripts/backup.sh

# Add to crontab (nightly at 2 AM)
crontab -e
# Tambahkan:
# 0 2 * * * /opt/noblekase/scripts/backup.sh >> /var/log/noblekase-backup.log 2>&1
```

### 4. Auto-Deploy via GitHub Actions (Optional)

Buat `.github/workflows/deploy.yml` yang SSH ke VPS lalu pull + rebuild saat push ke main. (Template tersedia—lihat dokumen Technical Spec.)

---

## Phase Roadmap

| Phase | Cakupan | Status |
|---|---|---|
| 1 | Infrastructure setup | ✅ Foundation siap |
| 2 | CMS schema + Customer frontend | ⏳ In progress (50%) |
| 3 | AI Integration (Groq) | ⏳ Stub ada, perlu integrasi |
| 4 | SEO automation | ⏳ Pending |
| 5 | Testing, migration, launch | ⏳ Pending |

Lihat `noblekase-technical-spec.html` untuk timeline detail per minggu.

---

## TODO yang Perlu Dilanjutkan

- [ ] Implement halaman Produk Listing (`/produk/[category]`)
- [ ] Implement halaman Produk Detail (`/produk/detail/[slug]`)
- [ ] Implement halaman Tentang, Journal, Kontak, Dukungan
- [ ] Connect data fetching ke Payload (semua section masih pakai default props)
- [ ] Implement i18n routing (next-intl) untuk ID/EN
- [ ] AI Chatbot endpoint + RAG integration dengan produk database
- [ ] AI Market Intelligence panel di Product admin
- [ ] AI Blog Draft Generator UI
- [ ] SEO automation (meta auto-gen, schema.org, sitemap, Indexing API)
- [ ] Search functionality (PostgreSQL FTS)
- [ ] Image upload via Sharp + variants
- [ ] Custom Logo & Icon untuk Payload admin
- [ ] Seed script (categories, marketplaces, FAQ default)
- [ ] Tests (Vitest unit + Playwright e2e)

---

## Contact

**PT Solusi Inovasi Bangsa**
[https://ide.asia](https://ide.asia)
