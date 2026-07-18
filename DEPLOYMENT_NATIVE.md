# Deployment Guide — Noblekase (Native, Tanpa Docker)

> Panduan redeploy ke VPS pada IP & port yang sama tanpa Docker.
> Stack: Node.js 22 + pnpm + PostgreSQL 16 + Redis 7 + PM2 (process manager).
> **Dibuat oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

---

## Target Deployment

| Item | Value |
|---|---|
| VPS IP | `72.60.74.202` |
| Port aplikasi | `8080` (langsung dari Next.js, tanpa reverse proxy)<br/>⚠️ Sebelumnya 6000 — diganti karena Next.js v15 menolak port yang masuk daftar "unsafe ports" browser (6000 = X11). Port aman lain: 3000, 4000, 8000, 8081 |
| Akses publik | `http://72.60.74.202:8080` |
| Admin CMS | `http://72.60.74.202:8080/admin` |
| Project dir | `/opt/noblekase` |
| App user | `noblekase` (non-root) |
| Database | PostgreSQL native, listen `127.0.0.1:5432` |
| Cache | Redis native, listen `127.0.0.1:6379` |
| Process manager | PM2 (managed via systemd) |
| SSL | Tidak — HTTP only (sampai domain pointing) |

> Asumsi: VPS Ubuntu 22.04 / 24.04 LTS, akses root via SSH, fresh start (data Docker lama dihapus).

---

## Quick Path (Otomatis)

Jika ingin tinggal jalankan:

```bash
# Di mesin lokal — kirim code & skrip ke VPS
cd "Website Noblekase"
tar --exclude='app/node_modules' --exclude='app/.next' \
    --exclude='app/uploads' --exclude='app/.git' \
    -czf noblekase.tar.gz app/
scp noblekase.tar.gz root@72.60.74.202:/tmp/

# SSH ke VPS, lalu:
ssh root@72.60.74.202
cd /tmp && tar -xzf noblekase.tar.gz
bash /tmp/app/scripts/deploy-native.sh
```

Skrip akan: hapus Docker lama → install Node/pnpm/Postgres/Redis/PM2 → buat user `noblekase` & database → setup firewall → install deps & build → start via PM2 → enable PM2 startup. Detail manual ada di bawah jika butuh kontrol per langkah.

---

## Phase 0 — Persiapan Lokal

Pack source code (tanpa folder berat):

```bash
cd "Website Noblekase"
tar --exclude='app/node_modules' \
    --exclude='app/.next' \
    --exclude='app/uploads' \
    --exclude='app/.git' \
    -czf noblekase.tar.gz app/
scp noblekase.tar.gz root@72.60.74.202:/tmp/
```

---

## Phase 1 — SSH & Bersihkan Docker Lama

```bash
ssh root@72.60.74.202

# Stop & hapus semua container, image, volume Docker
if command -v docker >/dev/null 2>&1; then
  docker compose -f /opt/noblekase/docker-compose.iponly.yml down -v 2>/dev/null || true
  docker compose -f /opt/noblekase/docker-compose.yml down -v 2>/dev/null || true
  docker stop $(docker ps -aq) 2>/dev/null || true
  docker rm -f $(docker ps -aq) 2>/dev/null || true
  docker volume rm $(docker volume ls -q) 2>/dev/null || true
  docker network prune -f
  docker system prune -af --volumes
fi

# Uninstall Docker engine sepenuhnya
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker.io 2>/dev/null || true
apt-get autoremove -y --purge
rm -rf /var/lib/docker /var/lib/containerd /etc/docker
rm -rf /opt/noblekase     # buang folder lama; akan kita populate ulang

# System update
apt-get update && apt-get upgrade -y
```

---

## Phase 2 — Install Dependencies (Native)

```bash
# Node.js 22 LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs build-essential

# pnpm 9 (sesuai engines di package.json)
npm install -g pnpm@9
npm install -g pm2

# PostgreSQL 16
install -d /usr/share/postgresql-common/pgdg
curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo "$VERSION_CODENAME")-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list
apt-get update
apt-get install -y postgresql-16

# Redis 7
apt-get install -y redis-server

# Verifikasi
node -v && pnpm -v && pm2 -v
psql --version
redis-server --version
```

---

## Phase 3 — Buat User Aplikasi & Folder

```bash
# User non-root khusus untuk app
useradd -r -m -d /opt/noblekase -s /bin/bash noblekase || true

# Folder log
mkdir -p /var/log/noblekase
chown -R noblekase:noblekase /var/log/noblekase

# Ekstrak code
mkdir -p /opt/noblekase
tar -xzf /tmp/noblekase.tar.gz -C /tmp
cp -r /tmp/app/. /opt/noblekase/
chown -R noblekase:noblekase /opt/noblekase

# Folder upload & backup (persistent)
sudo -u noblekase mkdir -p /opt/noblekase/uploads /opt/noblekase/backups
```

---

## Phase 4 — PostgreSQL Setup

```bash
# Generate password kuat
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
echo "POSTGRES_PASSWORD=$DB_PASS"   # SIMPAN nilai ini!

# Buat role & database
sudo -u postgres psql <<SQL
CREATE ROLE noblekase WITH LOGIN PASSWORD '$DB_PASS';
CREATE DATABASE noblekase OWNER noblekase ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE noblekase TO noblekase;
SQL

# Pastikan Postgres hanya listen localhost (default sudah benar, tapi pastikan)
PG_CONF=$(sudo -u postgres psql -tAc "SHOW config_file;")
sed -i "s/^#\?listen_addresses.*/listen_addresses = 'localhost'/" "$PG_CONF"

systemctl enable --now postgresql
systemctl restart postgresql

# Test koneksi
PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U noblekase -d noblekase -c '\conninfo'
```

---

## Phase 5 — Redis Setup

```bash
# Bind localhost saja, naikkan maxmemory
sed -i 's/^bind .*/bind 127.0.0.1 -::1/' /etc/redis/redis.conf
sed -i 's/^# maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
# Pastikan protected-mode aktif (default yes)
systemctl enable --now redis-server
systemctl restart redis-server
redis-cli ping       # → PONG
```

---

## Phase 6 — Environment Variables

```bash
cd /opt/noblekase
sudo -u noblekase cp .env.example .env
sudo -u noblekase nano .env
```

Isi minimum:

```env
# CORE
NEXT_PUBLIC_SITE_URL=http://72.60.74.202:8080
SERVER_URL=http://72.60.74.202:8080
NEXT_PUBLIC_DEFAULT_LOCALE=id
PAYLOAD_SECRET=GENERATE_DENGAN_openssl_rand_base64_32

# DATABASE — pakai password dari Phase 4
DATABASE_URI=postgres://noblekase:DB_PASS_DARI_PHASE_4@127.0.0.1:5432/noblekase

# REDIS
REDIS_URL=redis://127.0.0.1:6379

# UPLOADS
UPLOAD_DIR=/opt/noblekase/uploads

# OPTIONAL — set jika sudah punya
GROQ_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

Generate `PAYLOAD_SECRET`:

```bash
openssl rand -base64 32
```

> Catatan: `DATABASE_URI` sekarang pakai `127.0.0.1` (bukan `postgres` seperti di Docker), `REDIS_URL` pakai `127.0.0.1` (bukan `redis`).

---

## Phase 7 — Firewall

```bash
ufw allow 22/tcp
ufw allow 8080/tcp
ufw --force enable
ufw status
```

Tutup port lama yang sempat dibuka untuk Docker testing kalau ada. Postgres (5432) dan Redis (6379) **jangan** dibuka — mereka cuma listen di localhost.

> Verifikasi port 8080 dari mesin lokal:
> ```bash
> nmap -p 8080 72.60.74.202
> ```

---

## Phase 8 — Install Dependencies & Build

```bash
cd /opt/noblekase

# Kalau pnpm-lock.yaml ADA → reproducible install
# Kalau BELUM ada → install biasa (lockfile akan di-generate, lalu commit ke repo)
if [[ -f pnpm-lock.yaml ]]; then
  sudo -u noblekase pnpm install --frozen-lockfile
else
  sudo -u noblekase pnpm install
fi

sudo -u noblekase pnpm build
```

Build pertama: 3-8 menit. Output di `/opt/noblekase/.next`.

> Setelah deploy pertama sukses, commit file `pnpm-lock.yaml` yang di-generate ke repo Anda. Re-deploy berikutnya akan pakai `--frozen-lockfile` (reproducible, lebih aman).

> Jika build OOM (RAM ≤ 4GB), tambahkan swap:
> ```bash
> fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
> echo '/swapfile none swap sw 0 0' >> /etc/fstab
> ```

---

## Phase 9 — Start via PM2

Repo sudah punya `ecosystem.config.cjs` (PORT=8080, HOSTNAME=0.0.0.0, log ke `/var/log/noblekase/`).

```bash
cd /opt/noblekase

# Start sebagai user noblekase
sudo -u noblekase pm2 start ecosystem.config.cjs
sudo -u noblekase pm2 save

# Daftarkan PM2 ke systemd supaya auto-start saat reboot
pm2 startup systemd -u noblekase --hp /opt/noblekase
# Output akan minta jalankan satu command — copy & jalankan command tsb
systemctl enable pm2-noblekase
```

Verifikasi:

```bash
sudo -u noblekase pm2 status
sudo -u noblekase pm2 logs noblekase --lines 50
ss -ltnp | grep 8080
```

---

## Phase 10 — Verifikasi End-to-End

```bash
# Dari VPS
curl -I http://127.0.0.1:8080
curl -I http://127.0.0.1:8080/api/health

# Dari mesin lokal
curl -I http://72.60.74.202:8080
```

Browser:

- Frontend: `http://72.60.74.202:8080`
- Admin Payload: `http://72.60.74.202:8080/admin`

Akses `/admin` pertama kali akan minta buat Super Admin user.

---

## Update / Redeploy Berikutnya

```bash
# Sebagai noblekase user (atau sudo -u noblekase)
cd /opt/noblekase

# Opsi A: via git
git pull origin main

# Opsi B: via tarball
# scp noblekase-update.tar.gz root@72.60.74.202:/tmp/ (dari lokal)
# tar -xzf /tmp/noblekase-update.tar.gz -C /tmp
# rsync -a --delete --exclude=.env --exclude=uploads --exclude=node_modules --exclude=.next \
#   /tmp/app/ /opt/noblekase/

sudo -u noblekase pnpm install --frozen-lockfile
sudo -u noblekase pnpm build
sudo -u noblekase pm2 reload noblekase   # zero-downtime reload
sudo -u noblekase pm2 logs noblekase --lines 50
```

Downtime: ~0 detik untuk `pm2 reload` (graceful). Untuk skema yang lebih agresif gunakan `pm2 restart` (~2 detik downtime).

---

## Migrasi ke Domain + HTTPS (Nanti)

Saat `noblekase.co.id` sudah pointing ke `72.60.74.202`:

```bash
# Install Caddy native (auto SSL via Let's Encrypt)
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update && apt-get install -y caddy

# Caddyfile minimal (reverse proxy ke PM2 port 8080)
cat > /etc/caddy/Caddyfile <<EOF
noblekase.co.id, www.noblekase.co.id {
    encode gzip zstd
    reverse_proxy 127.0.0.1:8080
}
EOF

# Update .env: ganti SITE_URL ke https://noblekase.co.id
sed -i 's|http://72.60.74.202:8080|https://noblekase.co.id|g' /opt/noblekase/.env

# Buka 80/443, tutup 8080 dari publik
ufw allow 80/tcp
ufw allow 443/tcp
ufw delete allow 8080/tcp

systemctl reload caddy
sudo -u noblekase pm2 restart noblekase --update-env
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `pm2: command not found` | `npm install -g pm2` lalu `pm2 startup systemd -u noblekase --hp /opt/noblekase` |
| `Cannot connect to database` | Cek `systemctl status postgresql`, pastikan `DATABASE_URI` host = `127.0.0.1` (bukan `postgres`) |
| `ECONNREFUSED redis` | Cek `systemctl status redis-server`, pastikan `REDIS_URL=redis://127.0.0.1:6379` |
| Build OOM | Tambah swap 2GB (lihat Phase 8) |
| Port 8080 tidak dari luar | Cek `ufw status`, lalu `nmap -p 8080 72.60.74.202` dari lokal. Provider VPS mungkin block port di luar 80/443 |
| Upload gagal | `chown -R noblekase:noblekase /opt/noblekase/uploads` |
| PM2 tidak restart saat reboot | Pastikan `systemctl status pm2-noblekase` aktif & enabled |
| Next.js standalone error | `pnpm install` ulang lalu `pnpm build` — pastikan `node_modules` lengkap |

---

## Useful Commands

```bash
# PM2
sudo -u noblekase pm2 status
sudo -u noblekase pm2 logs noblekase
sudo -u noblekase pm2 logs noblekase --err
sudo -u noblekase pm2 reload noblekase            # zero-downtime
sudo -u noblekase pm2 restart noblekase           # full restart
sudo -u noblekase pm2 stop noblekase
sudo -u noblekase pm2 monit                        # interactive monitor

# PostgreSQL
sudo -u postgres psql -d noblekase
systemctl status postgresql
journalctl -u postgresql -n 100 --no-pager

# Redis
redis-cli
systemctl status redis-server

# System
ss -ltnp | grep -E '8080|5432|6379'
htop
df -h
```

---

## Backup (Native)

Setelah deploy berhasil, setup cron untuk backup nightly:

```bash
chmod +x /opt/noblekase/scripts/backup-native.sh
crontab -u noblekase -e
# Tambahkan:
# 0 2 * * * /opt/noblekase/scripts/backup-native.sh >> /var/log/noblekase/backup.log 2>&1
```

Skrip `backup-native.sh` melakukan `pg_dump` native (tanpa `docker exec`), tar uploads, optional GPG encrypt, optional upload ke Cloudflare R2 via `rclone`.

---

## Health Check Endpoint

`/api/health` return 200 jika OK. Cocok di-monitor dengan Uptime Kuma, BetterStack, atau UptimeRobot.

```bash
curl http://72.60.74.202:8080/api/health
```

---

## Rollback Strategy

```bash
cd /opt/noblekase

# Code rollback (via git)
git log --oneline -10
git reset --hard COMMIT_HASH
sudo -u noblekase pnpm install --frozen-lockfile
sudo -u noblekase pnpm build
sudo -u noblekase pm2 reload noblekase

# Database rollback (dari backup pg_dump)
sudo -u noblekase pm2 stop noblekase
sudo -u postgres pg_restore -d noblekase --clean --if-exists /opt/noblekase/backups/db_YYYYMMDD_HHMMSS.dump
sudo -u noblekase pm2 start noblekase
```

> ⚠️ Backup **selalu** sebelum redeploy besar atau migrasi schema.

---

## Perbedaan dengan Versi Docker

| Aspek | Docker (lama) | Native (sekarang) |
|---|---|---|
| Process orchestrator | `docker compose` | PM2 (managed via systemd) |
| PostgreSQL | container `postgres:16-alpine` | service `postgresql-16` |
| Redis | container `redis:7-alpine` | service `redis-server` |
| Network host | `postgres`, `redis` (DNS Docker) | `127.0.0.1` |
| Upload path | volume `./uploads` | folder `/opt/noblekase/uploads` |
| User | UID 1001 (Dockerfile) | system user `noblekase` |
| Restart policy | `restart: unless-stopped` | `pm2 startup` + `pm2 save` |
| Resource usage | ~600MB-1GB overhead | ~250MB lebih ringan |

---

**Dibuat oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))
