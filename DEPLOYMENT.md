# Deployment Guide — Noblekase

> Panduan deploy ke VPS (initial: IP+port, later: domain+HTTPS).
> **Dibuat oleh:** PT Solusi Inovasi Bangsa ([https://ide.asia](https://ide.asia))

---

## Target Awal: VPS IP + Port

- **VPS IP**: `72.60.74.202`
- **Port**: `6000`
- **Akses**: `http://72.60.74.202:6000`
- **Admin**: `http://72.60.74.202:6000/admin`
- **SSL**: tidak (HTTP only) — switch ke HTTPS saat domain pointing

---

## Phase 0 — Persiapan Lokal

### Opsi A: Via Git (Recommended)

```bash
cd app/
git init
git add .
git commit -m "Initial Noblekase project"
git remote add origin git@github.com:USER/noblekase.git
git push -u origin main
```

### Opsi B: Via SCP

```bash
cd "Website Noblekase"
tar -czf noblekase.tar.gz app/
scp noblekase.tar.gz root@72.60.74.202:/opt/
```

---

## Phase 1 — SSH & System Check

```bash
ssh root@72.60.74.202
cat /etc/os-release
df -h
free -h
```

Minimum requirement: 2 vCPU, 4 GB RAM, 20 GB disk.

---

## Phase 2 — Install Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version
```

---

## Phase 3 — Firewall

```bash
ufw allow 22/tcp
ufw allow 6000/tcp
ufw enable
ufw status
```

> **Catatan**: Beberapa provider VPS block port di luar 80/443. Verifikasi dengan `nmap -p 6000 72.60.74.202` dari mesin lokal.

---

## Phase 4 — Transfer Code

**Opsi A (Git):**
```bash
mkdir -p /opt/noblekase && cd /opt/noblekase
git clone git@github.com:USER/noblekase.git .
```

**Opsi B (SCP):**
```bash
cd /opt && tar -xzf noblekase.tar.gz && mv app noblekase && cd noblekase
```

---

## Phase 5 — Environment Variables

```bash
cp .env.example .env
nano .env
```

Required:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://72.60.74.202:6000` |
| `SERVER_URL` | `http://72.60.74.202:6000` |
| `PAYLOAD_SECRET` | Generate via `openssl rand -base64 32` |
| `POSTGRES_USER` | `noblekase` |
| `POSTGRES_PASSWORD` | Strong password |
| `POSTGRES_DB` | `noblekase` |
| `DATABASE_URI` | `postgres://noblekase:PASSWORD@postgres:5432/noblekase` |
| `REDIS_URL` | `redis://redis:6379` |

Optional (skip dulu jika belum daftar):
- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `GOOGLE_INDEXING_SERVICE_ACCOUNT_PATH`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

## Phase 6 — Build & Run

```bash
docker compose -f docker-compose.iponly.yml up -d --build
docker compose -f docker-compose.iponly.yml ps
docker compose -f docker-compose.iponly.yml logs -f app
```

Build pertama: 5-10 menit. Wait sampai log `Ready in XXX ms`.

---

## Phase 7 — Verifikasi

```bash
# Dari VPS
curl -I http://localhost:6000

# Dari luar (mesin lokal)
nmap -p 6000 72.60.74.202
curl -I http://72.60.74.202:6000
```

Browser:
- Frontend: `http://72.60.74.202:6000`
- Admin: `http://72.60.74.202:6000/admin`

---

## Phase 8 — First Admin User

Akses `/admin` pertama kali akan minta create user. Isi:
- Email
- Password (strong)
- Role: Super Admin (auto untuk first user)

---

## Phase 9 — Backup Cron (Optional)

```bash
chmod +x /opt/noblekase/scripts/backup.sh
crontab -e
# Tambahkan:
# 0 2 * * * /opt/noblekase/scripts/backup.sh >> /var/log/noblekase-backup.log 2>&1
```

Untuk full backup ke Cloudflare R2, perlu setup `rclone` terlebih dulu.

---

## Update / Redeploy

```bash
cd /opt/noblekase
git pull origin main
docker compose -f docker-compose.iponly.yml up -d --build
docker compose -f docker-compose.iponly.yml logs -f --tail=50 app
```

Downtime: ~30 detik per redeploy.

---

## Migrasi ke Domain + HTTPS

Saat domain `noblekase.com` sudah pointing ke `72.60.74.202`:

```bash
docker compose -f docker-compose.iponly.yml down

# Update .env: ganti site URL
nano .env

# Edit Caddyfile dengan domain Anda
sed -i 's/noblekase.com/DOMAIN_ANDA/g' Caddyfile

# Buka port 80 + 443
ufw allow 80/tcp
ufw allow 443/tcp
ufw delete allow 6000/tcp

# Start dengan Caddy (auto-SSL)
docker compose up -d --build
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `Cannot connect to database` | Wait 30 detik. `docker compose logs postgres` untuk debug. |
| Build OOM | Add swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab` |
| Port 6000 tidak accessible dari luar | Provider VPS mungkin block. Test `nmap`. Coba port 8080 atau hubungi provider. |
| Upload gagal | `mkdir -p /opt/noblekase/uploads && chown -R 1001:1001 /opt/noblekase/uploads` |
| Container restart loop | `docker compose logs --tail=100 app`. Biasanya env variable atau database. |

---

## Useful Commands

```bash
# Lihat semua containers
docker compose -f docker-compose.iponly.yml ps

# Stop all
docker compose -f docker-compose.iponly.yml down

# Stop + hapus volume (HATI-HATI: hilangkan database!)
docker compose -f docker-compose.iponly.yml down -v

# Restart 1 service
docker compose -f docker-compose.iponly.yml restart app

# Shell ke container
docker compose -f docker-compose.iponly.yml exec app sh
docker compose -f docker-compose.iponly.yml exec postgres psql -U noblekase

# View resource usage
docker stats

# View disk usage
docker system df
```

---

## Health Check Endpoint

App tersedia di `/api/health` (return 200 jika OK). Bisa di-monitor via:
- Uptime Kuma (self-hosted)
- BetterStack (free tier)
- UptimeRobot (free tier)

---

## Rollback Strategy

Jika redeploy menyebabkan masalah:

```bash
cd /opt/noblekase
git log --oneline -5            # Cek history
git revert HEAD                  # Revert commit terakhir
docker compose -f docker-compose.iponly.yml up -d --build
```

Atau rollback ke specific commit:
```bash
git reset --hard COMMIT_HASH
docker compose -f docker-compose.iponly.yml up -d --build
```

> Database changes tidak ter-rollback otomatis. Backup PostgreSQL sebelum deploy yang besar.
