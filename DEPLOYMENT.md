# Deployment Guide — Noblekase (Docker Compose)

**Disusun oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

Panduan ini bisa diikuti dari atas ke bawah di VPS yang benar-benar kosong.
Untuk deploy tanpa Docker (Node + PM2), lihat [`DEPLOYMENT_NATIVE.md`](./DEPLOYMENT_NATIVE.md).

---

## Peta stack

| Service | Image | Port | Peran |
|---|---|---|---|
| `caddy` | `caddy:2-alpine` | `80`, `443` | Reverse proxy + sertifikat Let's Encrypt otomatis |
| `app` | build dari `Dockerfile` | `3000` (internal) | Next.js 15 + Payload CMS 3 (satu proses) |
| `postgres` | `postgres:16-alpine` | `5432` (internal) | Database |
| `redis` | `redis:7-alpine` | `6379` (internal) | Cache, rate limit, cache respons AI |

Dua berkas compose tersedia:

| Berkas | Kapan dipakai |
|---|---|
| `docker-compose.yml` | Domain sudah pointing. Caddy aktif, HTTPS otomatis. |
| `docker-compose.iponly.yml` | Belum punya domain. Tanpa Caddy, app di-expose langsung ke port host. |

Situs berjalan dua bahasa: Indonesia tanpa prefix (`/produk`), Inggris dengan
prefix `/en` (`/en/produk`). Semuanya ditangani `src/middleware.ts` di dalam
aplikasi — **jangan** menambah aturan `/en` di Caddy. Detailnya di
[`docs/I18N.md`](./docs/I18N.md).

---

## 1. Prasyarat

### Spesifikasi VPS

| Item | Minimum | Disarankan |
|---|---|---|
| vCPU | 2 | 2–4 |
| RAM | 4 GB | 4 GB + 2 GB swap |
| Disk | 20 GB | 40 GB |
| OS | Ubuntu 22.04 / 24.04 LTS | sama |

Build image Next.js adalah bagian paling berat. Pada RAM 4 GB tambahkan swap
lebih dulu supaya `pnpm build` tidak kena OOM:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Docker + Compose plugin

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version      # harus v2.x — panduan ini pakai `docker compose`, bukan `docker-compose`
```

### Domain & DNS (opsional di awal)

Domain **tidak wajib** untuk deploy pertama. `docker-compose.iponly.yml` ada
justru supaya situs bisa hidup di `http://IP:PORT` sambil menunggu DNS.

Kalau domain sudah siap, buat dua A record ke IP VPS **sebelum** menjalankan
Caddy — Let's Encrypt memverifikasi lewat DNS + port 80, jadi record harus
sudah menyebar:

| Type | Name | Value |
|---|---|---|
| A | `@` | IP VPS |
| A | `www` | IP VPS |

Verifikasi: `dig +short noblekase.co.id` harus mengembalikan IP VPS.

### Firewall

```bash
ufw allow 22/tcp
# Mode domain:
ufw allow 80/tcp
ufw allow 443/tcp
# Mode IP-only (lihat catatan port di Bagian 6.2):
ufw allow 8080/tcp
ufw --force enable
ufw status
```

Port `5432` dan `6379` **tidak** dibuka — Postgres dan Redis hanya bicara di
jaringan Docker internal.

---

## 2. Setup pertama kali

### 2.1 Clone repo

```bash
mkdir -p /opt/noblekase && cd /opt/noblekase
git clone git@github.com:USER/noblekase.git .
```

Semua perintah selanjutnya diasumsikan dijalankan dari `/opt/noblekase`.
Path ini bukan sekadar konvensi: `scripts/backup.sh` menuliskannya secara
hardcoded (`PROJECT_DIR="/opt/noblekase"`).

### 2.2 Buat `.env`

```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Yang **wajib** diisi sebelum stack dinyalakan:

| Variabel | Nilai | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://noblekase.co.id` | Dipakai untuk canonical, hreflang, sitemap, OG. Baca peringatan di Bagian 3.1. |
| `SERVER_URL` | sama dengan di atas | `serverURL` Payload. |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `id` | Jangan diubah kecuali `src/lib/i18n.ts` ikut diubah. |
| `PAYLOAD_SECRET` | hasil generate | Kunci penandatangan JWT. Mengganti nilainya me-logout semua sesi. |
| `POSTGRES_USER` | `noblekase` | |
| `POSTGRES_PASSWORD` | hasil generate | |
| `POSTGRES_DB` | `noblekase` | |

Generate dua rahasia:

```bash
openssl rand -base64 32                          # → PAYLOAD_SECRET
openssl rand -base64 24 | tr -d '/+=' | cut -c1-24   # → POSTGRES_PASSWORD
```

**`DATABASE_URI` dan `REDIS_URL` sengaja TIDAK diisi di `.env` produksi.**
Kedua berkas compose menyusunnya sendiri di blok `environment:` dan menunjuk ke
service `postgres` / `redis`:

```yaml
DATABASE_URI: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
REDIS_URL: redis://redis:6379
```

Baris `environment:` menang atas `env_file:`, jadi mengisi `DATABASE_URI` di
`.env` tidak akan merusak apa-apa — tapi nilainya diabaikan, dan itu menyesatkan
saat debugging. Baris `DATABASE_URI=postgres://...@localhost:5432/...` di
`.env.example` hanya untuk development di mesin lokal. Kosongkan atau hapus di
server.

Yang **opsional**: `GROQ_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
`GOOGLE_INDEXING_SERVICE_ACCOUNT_PATH`, `GOOGLE_SEARCH_CONSOLE_PROPERTY`.
Semuanya bisa diisi belakangan lewat admin di **System → API Keys & Integrasi**
(hanya super-admin), dan nilai dari CMS menggantikan nilai di `.env`. Klien
tidak perlu menyentuh berkas `.env` untuk itu.

`ADMIN_EMAIL` / `ADMIN_PASSWORD` diisi sementara untuk Bagian 5, lalu
`ADMIN_PASSWORD` **dikosongkan lagi**.

---

## 3. Build & jalankan stack

### 3.1 Peringatan yang harus dibaca sebelum build

`.dockerignore` memuat `.env`, sehingga berkas itu **tidak ikut masuk ke stage
builder**. Next.js meng-inline seluruh variabel `NEXT_PUBLIC_*` pada saat build.
Akibatnya, apa adanya sekarang, `NEXT_PUBLIC_SITE_URL` bernilai kosong saat
build dan kode jatuh ke fallback `http://localhost:3000` di:

- `src/app/sitemap.ts`
- `src/app/(frontend)/[locale]/layout.tsx` (`metadataBase`)
- `src/components/seo/JsonLd.tsx`
- `src/lib/publishHooks.ts`
- `cors` / `csrf` di `src/payload.config.ts`

Situs tetap hidup, tapi canonical, hreflang, sitemap, dan URL yang diajukan ke
Google Indexing akan salah. Sebelum go-live, salah satu dari dua ini harus
dikerjakan di kode (lihat catatan di Bagian 9):

1. Tambahkan `ARG NEXT_PUBLIC_SITE_URL` + `ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL`
   di stage `builder` pada `Dockerfile`, lalu kirimkan lewat `build.args` di compose; **atau**
2. Keluarkan `.env` dari `.dockerignore` sehingga terbaca saat build.

Untuk deploy IP-only pertama yang sifatnya uji coba, hal ini bisa ditunda.

### 3.2 Build & start

Mode domain:

```bash
cd /opt/noblekase
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Mode IP-only:

```bash
docker compose -f docker-compose.iponly.yml up -d --build
docker compose -f docker-compose.iponly.yml ps
docker compose -f docker-compose.iponly.yml logs -f app
```

Build pertama memakan 5–12 menit. Yang terjadi di dalamnya (`Dockerfile`):

| Stage | Isi |
|---|---|
| `deps` | `pnpm install --frozen-lockfile` (fallback ke install biasa bila `pnpm-lock.yaml` belum ada) |
| `builder` | `BUILD_STANDALONE=true` → `pnpm payload generate:importmap` → `pnpm build` |
| `runner` | Menyalin `.next/standalone`, `.next/static`, `public/`, `node_modules/sharp`; jalan sebagai user `nextjs` (UID 1001); `CMD node server.js` |

Tunggu sampai log `app` menampilkan `Ready in …`. Cek kesehatan:

```bash
curl -s http://127.0.0.1:3000/api/health          # dari dalam container / mode domain
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(console.log)"
```

`/api/health` mengembalikan `200` hanya bila aplikasi **dan** database bisa
diakses, `503` bila database bermasalah. Pada tahap ini `database` masih boleh
`error` — tabelnya memang belum ada. Lanjut ke bagian berikutnya.

---

## 4. Skema database di server baru — BACA SELURUHNYA

Ini bagian yang paling sering salah, jadi ditulis apa adanya.

### 4.1 Kenapa skema tidak muncul sendiri

Di mesin development, Payload memakai **schema push**: setiap `pnpm dev`,
adapter Postgres menyamakan tabel dengan definisi collection secara otomatis.
Kode yang menentukan ada di `@payloadcms/db-postgres/dist/connect.js`:

```js
if (process.env.NODE_ENV !== 'production' && process.env.PAYLOAD_MIGRATING !== 'true' && this.push !== false) {
    await pushDevSchema(this);
}
```

Di produksi, `Dockerfile` menyetel `NODE_ENV=production`, jadi **push mati**.
`src/payload.config.ts` juga tidak menyetel opsi `prodMigrations`, jadi migrasi
**tidak** ikut jalan otomatis saat container boot. Konsekuensinya:

> Di server baru, skema tidak akan pernah terbentuk sendiri. Harus dibuat
> dengan satu langkah eksplisit.

### 4.2 Container `app` tidak bisa menjalankan migrasi atau seed

Stage `runner` hanya berisi output standalone. Tidak ada `pnpm`, tidak ada CLI
`payload`, tidak ada `src/`, tidak ada `src/migrations/`. Perintah semacam
`docker compose exec app pnpm migrate` **pasti gagal** — bukan karena salah
konfigurasi, melainkan karena berkasnya memang tidak ada di image.

Solusinya: bangun image bantu dari stage `builder`, yang punya `node_modules`
lengkap, seluruh `src/`, dan CLI `payload`.

```bash
cd /opt/noblekase
docker build --target builder -t noblekase-tools:latest .

# Nama network Docker = <nama-folder>_<nama-network>. Pastikan dulu:
docker network ls | grep noblekase        # umumnya: noblekase_noblekase
```

Template untuk menjalankan perintah apa pun di image bantu:

```bash
docker run --rm -it \
  --network noblekase_noblekase \
  --env-file /opt/noblekase/.env \
  -e DATABASE_URI="postgres://noblekase:PASSWORD_ANDA@postgres:5432/noblekase" \
  -e REDIS_URL="redis://redis:6379" \
  -v /opt/noblekase/uploads:/app/uploads \
  noblekase-tools:latest <PERINTAH>
```

`-e` setelah `--env-file` menimpa isi `.env`, jadi host database selalu benar.
Mount `uploads` wajib untuk perintah seed — script seed mengunggah berkas gambar
ke koleksi Media, dan berkasnya harus mendarat di volume yang sama dengan yang
dipakai container `app`.

### 4.3 Status migrasi saat ini — perlu diverifikasi sebelum go-live

`src/migrations/` **ada** dan terpasang benar (Payload memakai
`<folder payload.config>/migrations` sebagai default, dan `src/migrations/index.ts`
mendaftarkan ketiganya):

| Berkas | Tanggal |
|---|---|
| `20260713_061205.ts` | 13 Jul 2026 |
| `20260713_064549__.ts` | 13 Jul 2026 |
| `20260713_070721__.ts` | 13 Jul 2026 |

Masalahnya: **collection dan global berubah cukup banyak setelah tanggal itu**
dan belum ada migrasi baru. Perubahan pasca-13 Juli tercatat di `git log` pada
`src/collections/Slides.ts`, `Media.ts`, `Users.ts`, `Products.ts`, `Articles.ts`,
serta `src/globals/Header.ts`, `Footer.ts`, `pages/PageHome.ts`. Di development
hal ini tidak terasa karena push menutupi selisihnya.

> ⚠️ Artinya `pnpm migrate` di server baru kemungkinan besar menghasilkan skema
> yang **tidak sama** dengan kode yang sedang berjalan, dan gejalanya berupa
> error `column ... does not exist` saat membuka admin atau menyimpan dokumen.
> Ini satu-satunya bagian dari runbook ini yang belum bisa dipastikan dari kode
> saja — harus diuji di database kosong sebelum go-live.

### 4.4 Opsi A — jalankan migrasi (jalur yang benar untuk produksi)

Lakukan ini **setelah** memastikan ada migrasi yang mencakup seluruh perubahan.
Cara membuat migrasi yang kurang, dijalankan di mesin development yang skemanya
sudah sinkron:

```bash
# Di mesin dev, bukan di VPS
pnpm migrate:create
git add src/migrations && git commit -m "chore(db): migrasi skema terbaru" && git push
```

Lalu di server:

```bash
docker run --rm -it \
  --network noblekase_noblekase \
  --env-file /opt/noblekase/.env \
  -e DATABASE_URI="postgres://noblekase:PASSWORD_ANDA@postgres:5432/noblekase" \
  noblekase-tools:latest pnpm migrate
```

Cek hasilnya:

```bash
docker compose exec postgres psql -U noblekase -d noblekase -c '\dt' | head -30
docker compose exec postgres psql -U noblekase -d noblekase -c 'SELECT name, batch FROM payload_migrations ORDER BY id;'
```

### 4.5 Opsi B — schema push sekali di server (hanya untuk database kosong)

Bila migrasi belum lengkap dan situs harus segera hidup, skema bisa dibentuk
dengan menyalakan push sekali secara sengaja: jalankan proses Payload apa pun
dengan `NODE_ENV=development` menempel ke database produksi yang **masih kosong**.

```bash
docker run --rm -it \
  --network noblekase_noblekase \
  --env-file /opt/noblekase/.env \
  -e NODE_ENV=development \
  -e DATABASE_URI="postgres://noblekase:PASSWORD_ANDA@postgres:5432/noblekase" \
  -v /opt/noblekase/uploads:/app/uploads \
  noblekase-tools:latest pnpm create:admin
```

Payload akan membangun seluruh tabel lebih dulu, lalu script berjalan.

Batasannya jelas dan harus dipahami:

- Hanya aman pada database **kosong**. Pada database berisi, push bisa meminta
  konfirmasi perubahan destruktif atau membuang kolom.
- Tabel `payload_migrations` tidak terisi, jadi `pnpm migrate` berikutnya akan
  mencoba menjalankan migrasi dari awal di atas skema yang sudah ada.
- Ini utang teknis, bukan solusi. Setelah live, samakan `src/migrations/` dengan
  skema sebenarnya dan pindah ke Opsi A.

---

## 5. Seed konten & admin pertama

Urutannya penting — script belakangan merujuk dokumen yang dibuat script
sebelumnya.

| # | Perintah | Isi |
|---|---|---|
| 1 | `pnpm seed` | Kerangka dasar: kategori, sub-kategori, produk, marketplace, media, hero |
| 2 | `pnpm seed:content` | Konten editorial: artikel Journal, halaman, FAQ, global Header/Footer/SiteSettings |
| 3 | `pnpm seed:translations` | Mengisi versi bahasa Inggris (`locale=en`) untuk konten di atas |
| 4 | `pnpm create:admin` | User super-admin pertama |

Semuanya lewat image bantu:

```bash
RUN_TOOL() {
  docker run --rm -it \
    --network noblekase_noblekase \
    --env-file /opt/noblekase/.env \
    -e DATABASE_URI="postgres://noblekase:PASSWORD_ANDA@postgres:5432/noblekase" \
    -e REDIS_URL="redis://redis:6379" \
    -v /opt/noblekase/uploads:/app/uploads \
    noblekase-tools:latest "$@"
}

RUN_TOOL pnpm seed
RUN_TOOL pnpm seed:content
RUN_TOOL pnpm seed:translations
```

`pnpm seed` bersifat idempotent: bila sudah ada produk, script berhenti sendiri.
Untuk memaksanya ulang, tambahkan `-e FORCE_SEED=true`.

### Admin pertama

Isi `ADMIN_EMAIL`, `ADMIN_NAME`, dan `ADMIN_PASSWORD` di `.env`, lalu:

```bash
RUN_TOOL pnpm create:admin
```

Script melewati endpoint REST `/first-register` dan langsung membuat user
`role: superAdmin` lewat local API. Bila email tersebut sudah ada, script
melewatinya tanpa error.

Setelah user jadi, **kosongkan `ADMIN_PASSWORD` di `.env`** — jangan tinggalkan
password akun aktif di berkas server. Login di `https://DOMAIN/admin`.

> Membuat user pertama lewat halaman `/admin` juga bisa, tapi hanya berhasil
> kalau tabel `users` sudah ada. Di server baru, langkah Bagian 4 tetap harus
> selesai lebih dulu.

Perintah lain yang tersedia di image bantu:

| Perintah | Fungsi |
|---|---|
| `pnpm reset:content` | Menghapus konten hasil seed. **Destruktif** — backup dulu. |
| `pnpm generate:importmap` | Regenerasi import map admin. Sudah otomatis dijalankan di build. |
| `pnpm migrate:create` | Membuat berkas migrasi baru dari selisih skema. |

---

## 6. Domain, HTTPS, dan jalur IP-only

### 6.1 Mode domain (Caddy)

`Caddyfile` sudah berisi domain produksi `noblekase.co.id`, jadi tidak perlu
disunting. Yang wajib dipastikan lebih dulu adalah DNS:

| Record | Nama | Nilai |
|---|---|---|
| A | `@` | IP VPS |
| A | `www` | IP VPS |

Caddy meminta sertifikat Let's Encrypt saat container boot. Bila salah satu
record belum resolve, permintaan itu **gagal** dan Caddy akan mencoba ulang
dengan jeda yang makin panjang — jadi verifikasi dulu:

```bash
dig +short noblekase.co.id
dig +short www.noblekase.co.id
```

Alamat `email admin@noblekase.co.id` di blok global dipakai Let's Encrypt untuk
notifikasi kedaluwarsa sertifikat — pastikan alamat itu benar-benar dibaca
seseorang.

```bash
ufw allow 80/tcp && ufw allow 443/tcp
docker compose up -d --build
docker compose logs -f caddy      # tunggu baris "certificate obtained successfully"
```

Yang sudah diatur di `Caddyfile` dan tidak perlu ditambah lagi:

| Bagian | Isi |
|---|---|
| Redirect | `www.DOMAIN` → apex, permanen |
| Header keamanan | HSTS 1 tahun + preload, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `-Server` |
| Cache statis | `/_next/static/*`, `/favicon.ico`, `/robots.txt`, `/sitemap*.xml` → 1 tahun immutable |
| Cache gambar | `/_next/image*` dan `/api/media/file/*` → 30 hari |
| Admin | `/admin*` → `Cache-Control: no-store` |
| Proxy | `reverse_proxy app:3000` + `X-Real-IP` / `X-Forwarded-*` + health check `/api/health` |
| Log | `/var/log/caddy/access.log`, roll 100 MB × 5 |

Dua hal yang gampang dirusak tanpa sadar:

- **Jangan** menambahkan aturan redirect `/en` di Caddy. Pemetaan bahasa
  ditangani `src/middleware.ts`; aturan tambahan akan bentrok dan menghasilkan
  redirect berulang.
- Pola cache gambar harus tetap `/api/media/file/*`. Berkas upload **tidak**
  disajikan di `/uploads` — itu hanya lokasi berkas di disk (`staticDir` di
  `src/collections/Media.ts`). Pola lama `/uploads/*` tidak pernah cocok
  sehingga gambar CMS sama sekali tidak ter-cache.

Untuk uji coba tanpa membakar kuota Let's Encrypt, aktifkan baris staging di
`Caddyfile` (`acme_ca …acme-staging-v02…`), lalu matikan lagi saat sudah benar.

### 6.2 Mode IP-only

`docker-compose.iponly.yml` membuang Caddy dan mem-publish app langsung ke host.

> ⚠️ Bawaannya `- "6000:3000"`, dan **port 6000 tidak bisa dibuka dari browser**.
> Chrome dan Firefox memblokirnya sebagai unsafe port (6000 = X11) dengan
> `ERR_UNSAFE_PORT`. Selain itu `next.config.ts` hanya mengizinkan
> `http://72.60.74.202:8080` di `images.remotePatterns`, sehingga di port lain
> `next/image` menolak memuat gambar. Ubah pemetaannya ke `8080:3000` sebelum
> start:

```bash
sed -i 's/"6000:3000"/"8080:3000"/' /opt/noblekase/docker-compose.iponly.yml
ufw allow 8080/tcp
docker compose -f docker-compose.iponly.yml up -d --build
```

Set `NEXT_PUBLIC_SITE_URL` dan `SERVER_URL` ke `http://IP-VPS:8080`.

Perbedaan lain yang perlu diketahui: varian IP-only **tidak** punya
`healthcheck` maupun batas ukuran log seperti `docker-compose.yml`, jadi
`docker compose ps` hanya menampilkan `running`, bukan `healthy`.

Verifikasi dari luar:

```bash
nmap -p 8080 IP-VPS
curl -I http://IP-VPS:8080
curl -s http://IP-VPS:8080/api/health
```

Beberapa provider VPS memblokir port di luar 80/443. Kalau `nmap` menunjukkan
`filtered` padahal `ufw` sudah allow, masalahnya di sisi provider.

### 6.3 Pindah dari IP-only ke domain

```bash
cd /opt/noblekase
docker compose -f docker-compose.iponly.yml down     # TANPA -v; volume data harus tetap

nano .env                                            # SITE_URL & SERVER_URL → https://DOMAIN
sed -i 's/noblekase\.com/DOMAIN-ANDA.com/g' Caddyfile

ufw allow 80/tcp && ufw allow 443/tcp
ufw delete allow 8080/tcp

docker compose up -d --build                         # sekarang dengan Caddy
```

Volume `postgres_data` dan folder `uploads/` dipakai bersama oleh kedua berkas
compose selama nama project (nama folder) tidak berubah, jadi data ikut pindah.
Rebuild wajib, bukan sekadar restart: `NEXT_PUBLIC_SITE_URL` ter-inline saat
build (lihat Bagian 3.1).

---

## 7. Persistensi — apa yang selamat saat rebuild

| Path / volume | Jenis | Isi | Selamat `up --build`? | Selamat `down`? | Selamat `down -v`? |
|---|---|---|---|---|---|
| `/opt/noblekase/uploads` → `/app/uploads` | bind mount | Berkas gambar asli + turunan (thumbnail, square, wide, og, …) | ✅ | ✅ | ✅ |
| `/opt/noblekase/backups` → `/backups` (postgres) | bind mount | Folder tujuan dump manual | ✅ | ✅ | ✅ |
| `postgres_data` | named volume | Seluruh database | ✅ | ✅ | ❌ **hilang** |
| `redis_data` | named volume | Cache, counter rate limit | ✅ | ✅ | ❌ (aman dibuang) |
| `caddy_data` | named volume | Sertifikat & akun ACME | ✅ | ✅ | ❌ (harus terbit ulang) |
| `caddy_config`, `caddy_logs` | named volume | State autosave & access log | ✅ | ✅ | ❌ |
| Image `noblekase-app:latest` | image | Hasil build | dibangun ulang | — | — |

Yang perlu digarisbawahi:

- `uploads/` sengaja bind mount, bukan named volume, supaya berkas gambar tetap
  ada dan mudah di-backup dari host meski container dibangun ulang — dan supaya
  tidak ikut terhapus oleh `down -v` yang tidak disengaja.
- **`docker compose down -v` menghapus database.** Tidak ada langkah dalam
  runbook ini yang memerlukannya.
- Direktori `/app/uploads` di image dibuat dengan pemilik `nextjs:nodejs`
  (UID/GID 1001). Bila folder host dibuat oleh root dengan mode ketat, upload
  akan gagal — lihat Bagian 9.
- Sertifikat ada di `caddy_data`. Menghapusnya memaksa penerbitan ulang dan bisa
  kena rate limit Let's Encrypt (5 sertifikat identik per minggu).

---

## 8. Operasi rutin

Di mode IP-only, tambahkan `-f docker-compose.iponly.yml` pada setiap perintah
`docker compose` di bawah.

### 8.1 Deploy update

```bash
cd /opt/noblekase
git pull origin main
docker compose up -d --build
docker compose logs -f --tail=50 app
```

Downtime ± 30–60 detik saat container app diganti. Kalau ada perubahan skema,
jalankan langkah Bagian 4 **sesudah** image baru jalan.

### 8.2 Log

```bash
docker compose logs -f app                  # ikuti live
docker compose logs --tail=200 app          # 200 baris terakhir
docker compose logs --since 30m app         # 30 menit terakhir
docker compose logs postgres caddy          # beberapa service sekaligus

# Access log Caddy (di dalam volume caddy_logs)
docker compose exec caddy tail -f /var/log/caddy/access.log
```

Log app dibatasi 10 MB × 5 berkas oleh `docker-compose.yml` supaya disk VPS
tidak habis. Batas ini **tidak ada** di varian IP-only.

### 8.3 Restart & inspeksi

```bash
docker compose restart app                  # restart satu service
docker compose ps                           # status + health
docker stats                                # CPU/RAM real-time
docker system df                            # pemakaian disk Docker
docker compose exec app sh                  # shell ke app (runner: minim, tanpa pnpm)
docker compose exec postgres psql -U noblekase -d noblekase
```

Bersihkan image lama secara berkala setelah beberapa kali redeploy:

```bash
docker image prune -f
```

### 8.4 Backup

`scripts/backup.sh` melakukan: `pg_dump -Fc` → arsip `uploads/` → enkripsi GPG
(bila `BACKUP_GPG_PASSPHRASE` diisi) → upload ke Cloudflare R2 via `rclone`.

Hal yang harus diketahui sebelum memasang cron:

| Hal | Kenyataan |
|---|---|
| Direktori kerja | Hardcoded `/opt/noblekase` |
| Lokasi kerja sementara | `/tmp/noblekase-backup`, dihapus lewat `trap` saat selesai |
| Tujuan akhir | `r2:noblekase-backup/YYYY/MM` — **bukan** folder `./backups` |
| `rclone` | Wajib sudah dikonfigurasi. Script pakai `set -euo pipefail`, jadi tanpa remote `r2` seluruh backup gagal di langkah upload. |
| Enkripsi | Aktif hanya bila `BACKUP_GPG_PASSPHRASE` ada di environment |
| Kredensial DB | Dibaca dari environment shell, **bukan** dari `.env`. Tanpa itu jatuh ke default `noblekase`/`noblekase`. |
| Restore | Tidak ada. Script ini hanya membuat backup. |

Setup:

```bash
chmod +x /opt/noblekase/scripts/backup.sh
rclone config          # buat remote bernama persis `r2`

# Uji manual dulu — jangan langsung percaya cron
POSTGRES_USER=noblekase POSTGRES_DB=noblekase /opt/noblekase/scripts/backup.sh
```

Cron nightly jam 02:00:

```bash
crontab -e
```

```cron
0 2 * * * POSTGRES_USER=noblekase POSTGRES_DB=noblekase BACKUP_GPG_PASSPHRASE='rahasia-anda' /opt/noblekase/scripts/backup.sh >> /var/log/noblekase-backup.log 2>&1
```

Bila belum mau memakai R2, dump lokal bisa dijalankan langsung ke folder
`backups/` yang sudah ter-mount ke container Postgres:

```bash
docker compose exec -T postgres pg_dump -U noblekase -Fc noblekase \
  > /opt/noblekase/backups/db_$(date +%Y%m%d_%H%M%S).dump
tar -czf /opt/noblekase/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz \
  -C /opt/noblekase uploads/
```

### 8.5 Restore (manual — tidak ada script-nya)

Tidak ada subperintah restore di mana pun dalam repo. Prosedurnya dijalankan
tangan per tangan.

```bash
cd /opt/noblekase

# 1. Ambil dump. Bila dari R2:
rclone copy r2:noblekase-backup/2026/07/db_20260718_020000.dump.gpg /tmp/

# 2. Dekripsi bila terenkripsi GPG (akan menanyakan passphrase)
gpg --decrypt /tmp/db_20260718_020000.dump.gpg > /tmp/db.dump

# 3. Hentikan app supaya tidak ada koneksi yang menulis saat restore
docker compose stop app

# 4. Salin dump ke container Postgres
docker compose cp /tmp/db.dump postgres:/tmp/db.dump

# 5. Restore. --clean --if-exists membuang objek lama lebih dulu;
#    tanpa itu restore gagal karena tabelnya sudah ada.
docker compose exec -T postgres pg_restore \
  -U noblekase -d noblekase --clean --if-exists /tmp/db.dump

# 6. Berkas gambar — hanya bila folder uploads ikut hilang
tar -xzf /tmp/uploads_20260718_020000.tar.gz -C /opt/noblekase/
chown -R 1001:1001 /opt/noblekase/uploads

# 7. Nyalakan lagi
docker compose start app
docker compose logs -f --tail=50 app
```

Restore ke database yang benar-benar kosong (misalnya saat pindah server):
buang `--clean --if-exists` dan pastikan role `noblekase` sudah dibuat lebih
dulu — `pg_restore` tidak membuat owner-nya sendiri.

```bash
docker compose exec postgres psql -U noblekase -d noblekase -c "SELECT count(*) FROM products;"
```

> Uji prosedur ini **sebelum** dibutuhkan. Backup yang belum pernah di-restore
> belum bisa disebut backup.

### 8.6 Rollback

```bash
cd /opt/noblekase
git log --oneline -10
git checkout <commit-stabil>
docker compose up -d --build
```

Rollback kode tidak mengembalikan database. Bila migrasi sempat jalan di deploy
yang gagal, restore database dari dump terakhir (Bagian 8.5).

---

## 9. Troubleshooting

### Build gagal di langkah `COPY /app/.next/standalone`

```
failed to compute cache key: "/app/.next/standalone": not found
```

Output standalone hanya dibuat bila `BUILD_STANDALONE=true` — `next.config.ts`
memasang `output: "standalone"` di balik flag itu, dan `Dockerfile` menyetelnya
di stage builder. Kalau error ini muncul:

1. Pastikan `ENV BUILD_STANDALONE=true` masih ada di stage `builder` pada `Dockerfile`.
2. Pastikan blok gate di `next.config.ts` tidak dihapus atau dikomentari.
3. Build tanpa cache: `docker compose build --no-cache app`.

Flag ini sengaja tidak dinyalakan permanen supaya `pnpm dev` dan deploy native
(PM2 + `next start`) tidak berubah perilakunya.

Kalau image ter-build tapi container crash saat memproses gambar pertama,
penyebabnya biasanya `sharp`: penelusuran dependency Next kerap melewatkan
binary native ketika `node_modules` berupa symlink pnpm. `Dockerfile` menyalin
`node_modules/sharp` secara manual dan `next.config.ts` menyetel
`outputFileTracingRoot` untuk itu — keduanya harus tetap ada.

### Panel admin blank / komponen kustom hilang

Gejala: `/admin` memuat tapi layarnya kosong, logo Noblekase tidak muncul, atau
console browser menampilkan error resolusi modul.

Penyebabnya `app/(payload)/admin/importMap.js` tidak ter-generate. Komponen
admin kustom (Logo, Icon, PoweredBy, ikon sidebar) diresolusi lewat berkas itu.
`Dockerfile` menjalankan `pnpm payload generate:importmap` **sebelum** `pnpm build`,
sengaja tanpa `|| true` — bila langkah itu gagal, build ikut gagal, karena
alternatifnya adalah panel admin yang rusak diam-diam di produksi.

Periksa:

```bash
docker compose build app 2>&1 | grep -A5 "generate:importmap"
```

Regenerasi lewat image bantu bila ada penambahan komponen admin, lalu commit
hasilnya dan build ulang:

```bash
docker run --rm -v /opt/noblekase:/app -w /app noblekase-tools:latest pnpm generate:importmap
```

### Gambar 404 setelah redeploy

Berkas upload disajikan Payload di **`/api/media/file/<filename>`**, bukan di
`/uploads`. `/uploads` cuma lokasi berkas di disk (`staticDir` di
`src/collections/Media.ts`) dan bukan rute publik. Urutan pemeriksaan:

```bash
# 1. Berkasnya ada di host?
ls -la /opt/noblekase/uploads | head

# 2. Terlihat di dalam container?
docker compose exec app ls -la /app/uploads | head

# 3. Payload menyajikannya?
curl -I https://DOMAIN/api/media/file/nama-berkas.webp
```

| Temuan | Penyebab | Perbaikan |
|---|---|---|
| Host kosong, database berisi | `uploads/` pernah terhapus / server baru tanpa restore | Ekstrak `uploads_*.tar.gz` dari backup |
| Host berisi, container kosong | Bind mount tidak terpasang atau project dijalankan dari folder lain | Jalankan compose dari `/opt/noblekase`; cek `docker compose config` bagian `volumes` |
| Ada di keduanya, tapi 404 | Nama berkas di database beda dengan di disk | Cek `SELECT filename FROM media LIMIT 10;` lalu cocokkan dengan `ls uploads/` |
| 403 / upload gagal | Pemilik folder salah | `chown -R 1001:1001 /opt/noblekase/uploads` |
| Gambar lama 404 hanya di `next/image` | Host tidak ada di `images.remotePatterns` | Tambahkan host/port ke `next.config.ts` lalu rebuild |

Container app berjalan sebagai UID 1001 (`nextjs`). Semua berkas di
`/opt/noblekase/uploads` harus dimiliki UID itu.

### Header / Footer kosong atau navbar blank

Global Payload (`Header`, `Footer`, `SiteSettings`) punya `defaultValue`, tapi
**nilai default hanya dipakai selama dokumen global belum pernah disimpan** —
tidak ada baris di database untuk global tersebut. Yang tampak: situs terlihat
normal di awal, lalu setelah seseorang membuka dan menyimpan global itu, isinya
berubah atau jadi kosong.

Efek sampingnya sudah pernah menggigit: `defaultValue` tidak divalidasi, jadi
baris logo tengah pada `mobileBottomNav` (label kosong, `isCenterLogo: true`)
lolos selama masih memakai default, tapi langsung gagal validasi begitu
global-nya benar-benar disimpan. Karena itu `label` di sana sengaja tidak
`required`.

Perbaikan:

1. Jalankan `pnpm seed:content` — script itu menuliskan baseline Header/Footer
   ke database sehingga tidak lagi bergantung pada default.
2. Atau buka **Admin → Globals → Header**, isi, lalu **Save** satu kali. Ulangi
   untuk Footer dan Site Settings, termasuk pada locale `en`.
3. Setelah global punya baris di database, ganti bahasa field ke English, isi,
   lalu simpan. Versi Indonesia harus tetap utuh.

Cek langsung ke database:

```bash
docker compose exec postgres psql -U noblekase -d noblekase -c '\dt' | grep -i -E 'header|footer'
```

### Masalah umum lain

| Gejala | Penyebab & perbaikan |
|---|---|
| `Cannot connect to database` saat boot | Postgres belum siap. `depends_on` sudah memakai `condition: service_healthy`, jadi biasanya cukup tunggu. Bila menetap: `docker compose logs postgres`, dan pastikan `POSTGRES_PASSWORD` di `.env` tidak kosong. |
| Password DB diubah tapi app tetap ditolak | `postgres` hanya memakai `POSTGRES_PASSWORD` saat volume dibuat pertama kali. Ubah di dalam DB: `ALTER USER noblekase WITH PASSWORD '…';` — bukan dengan menghapus volume. |
| `column ... does not exist` di admin | Skema tertinggal dari kode. Lihat Bagian 4.3. |
| Container app restart terus | `docker compose logs --tail=100 app`. Paling sering `PAYLOAD_SECRET` kosong atau `DATABASE_URI` salah host. |
| Build OOM / terbunuh | Tambah swap 2 GB (Bagian 1). |
| Caddy gagal dapat sertifikat | DNS belum menyebar, port 80 tertutup, atau kena rate limit Let's Encrypt. Cek `docker compose logs caddy`; uji dengan `acme_ca` staging. |
| `/api/health` mengembalikan 503 | Aplikasi hidup tapi database tidak terjangkau — endpoint memang menguji koneksi DB dengan `payload.count({ collection: 'users' })`. |
| `docker compose exec app pnpm …` → `not found` | Wajar. Image runner tidak berisi pnpm atau `src/`. Pakai image bantu (Bagian 4.2). |
| `/id/produk` tidak teralihkan ke `/produk` | Middleware tidak jalan (mis. ada aturan bahasa yang ditambahkan di Caddy). Hapus aturan itu. |
| Chatbot / fitur AI mati | `GROQ_API_KEY` kosong, atau `AI_BUDGET_CAP_USD` sudah tercapai. Isi lewat **Admin → System → API Keys & Integrasi**. |

---

## 10. Verifikasi sebelum menyatakan live

Jalankan [`docs/UAT-CHECKLIST.md`](./docs/UAT-CHECKLIST.md) secara utuh —
halaman publik ID & EN, perpindahan bahasa, tampilan mobile, pencarian &
chatbot, panel admin, SEO, keamanan, dan performa — lalu ulangi bagian *smoke
test* langsung di domain produksi setelah go-live.

Empat hal yang sering terlewat dan sebaiknya dicek lebih dulu:

```bash
curl -s https://DOMAIN/api/health                       # app + database sehat
curl -s https://DOMAIN/sitemap.xml | head -20           # memuat URL ID dan /en
curl -sI https://DOMAIN/api/media/file/<berkas>.webp    # gambar CMS tersaji
curl -sI https://DOMAIN/id/produk | grep -i location    # 308 → /produk
```

---

*Dokumen ini disusun oleh PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia)).*
