#!/usr/bin/env bash
# =====================================
# Noblekase — Native Deploy Script (tanpa Docker)
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# =====================================
#
# Target:  http://72.60.74.202:6000
# Stack:   Node 22 + pnpm + PostgreSQL 16 + Redis 7 + PM2
#
# Usage (di VPS, sebagai root):
#   bash /tmp/app/scripts/deploy-native.sh
#
# Skrip ini:
#   1. Membersihkan Docker lama (fresh start)
#   2. Install Node/pnpm/Postgres/Redis/PM2
#   3. Membuat user `noblekase` & database
#   4. Konfigurasi firewall (port 22 & 6000)
#   5. Install deps, build, start via PM2
#   6. Daftar PM2 ke systemd (auto-start on boot)
#
# Idempotent: aman dijalankan ulang. Konfigurasi yang sudah ada di-skip.
# =====================================

set -euo pipefail

# === CONFIG ===
APP_USER="noblekase"
APP_DIR="/opt/noblekase"
LOG_DIR="/var/log/noblekase"
APP_PORT="8080"   # bukan 6000 — Next.js v15 menolak port yang masuk daftar "unsafe ports" browser (X11)
DB_NAME="noblekase"
DB_USER="noblekase"
SOURCE_DIR="${SOURCE_DIR:-/tmp/app}"   # lokasi extracted tarball, override via env
NODE_MAJOR="22"

# === HELPERS ===
log()  { echo -e "\033[1;34m[$(date +'%H:%M:%S')]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERROR]\033[0m $*" >&2; }
die()  { err "$*"; exit 1; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    die "Skrip ini harus dijalankan sebagai root (gunakan sudo)."
  fi
}

cmd_exists() { command -v "$1" >/dev/null 2>&1; }

# === MAIN ===
require_root

log "==> Phase 1: Cleanup Docker lama (jika ada)"
if cmd_exists docker; then
  warn "Docker terdeteksi — akan dihapus total beserta data."
  docker compose -f "${APP_DIR}/docker-compose.iponly.yml" down -v 2>/dev/null || true
  docker compose -f "${APP_DIR}/docker-compose.yml" down -v 2>/dev/null || true
  docker stop $(docker ps -aq) 2>/dev/null || true
  docker rm -f $(docker ps -aq) 2>/dev/null || true
  docker volume rm $(docker volume ls -q) 2>/dev/null || true
  docker network prune -f || true
  docker system prune -af --volumes || true

  apt-get purge -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin docker.io 2>/dev/null || true
  apt-get autoremove -y --purge
  rm -rf /var/lib/docker /var/lib/containerd /etc/docker
  log "Docker uninstalled."
else
  log "Docker tidak terdeteksi — lanjut."
fi

# Hapus folder app lama supaya benar-benar fresh
if [[ -d "$APP_DIR" ]]; then
  warn "Menghapus ${APP_DIR} lama..."
  # Stop PM2 lama jika ada
  if cmd_exists pm2; then
    sudo -u "$APP_USER" pm2 delete all 2>/dev/null || true
  fi
  rm -rf "${APP_DIR}"
fi

log "==> Phase 2: System update"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y curl ca-certificates gnupg lsb-release ufw \
  build-essential openssl rsync git

log "==> Phase 3: Install Node.js ${NODE_MAJOR} LTS"
if ! cmd_exists node || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
hash -r   # clear bash command cache supaya path lookup fresh
# Deteksi konflik: ada node lain (mis. /usr/local/bin) yang shadowing?
ALL_NODES=$(command -v -a node 2>/dev/null | sort -u || true)
ACTIVE_NODE=$(command -v node)
ACTIVE_VER=$(node -v 2>/dev/null || echo "none")
if [[ "$(echo "$ACTIVE_VER" | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]]; then
  warn "node aktif: ${ACTIVE_NODE} = ${ACTIVE_VER}. Ditemukan binari node lain:"
  echo "$ALL_NODES"
  warn "PATH untuk script ini akan dipaksa pakai /usr/bin (NodeSource v${NODE_MAJOR})."
  export PATH="/usr/bin:$PATH"
  hash -r
fi
log "Node $(node -v), npm $(npm -v) (via $(command -v node))"

log "==> Phase 4: Install pnpm 9 & PM2"
npm install -g pnpm@9 pm2 >/dev/null
log "pnpm $(pnpm -v), pm2 $(pm2 -v)"

log "==> Phase 5: Install PostgreSQL 16"
if ! cmd_exists psql || ! psql --version | grep -q " 16"; then
  install -d /usr/share/postgresql-common/pgdg
  curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc
  CODENAME=$(. /etc/os-release && echo "$VERSION_CODENAME")
  echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt ${CODENAME}-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update
  apt-get install -y postgresql-16
fi
systemctl enable --now postgresql
log "PostgreSQL: $(psql --version)"

log "==> Phase 6: Install Redis 7"
apt-get install -y redis-server
# Bind localhost saja
sed -i 's/^bind .*/bind 127.0.0.1 -::1/' /etc/redis/redis.conf
grep -q '^maxmemory ' /etc/redis/redis.conf \
  && sed -i 's/^maxmemory .*/maxmemory 256mb/' /etc/redis/redis.conf \
  || echo 'maxmemory 256mb' >> /etc/redis/redis.conf
grep -q '^maxmemory-policy ' /etc/redis/redis.conf \
  && sed -i 's/^maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf \
  || echo 'maxmemory-policy allkeys-lru' >> /etc/redis/redis.conf
systemctl enable --now redis-server
systemctl restart redis-server
redis-cli ping | grep -q PONG && log "Redis OK"

log "==> Phase 7: Buat user aplikasi & folder"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd -r -m -d "$APP_DIR" -s /bin/bash "$APP_USER"
fi
mkdir -p "$LOG_DIR"
chown -R "$APP_USER:$APP_USER" "$LOG_DIR"

log "==> Phase 8: Copy source code"
[[ -d "$SOURCE_DIR" ]] || die "Source folder $SOURCE_DIR tidak ada. Set env SOURCE_DIR atau extract tarball ke /tmp/app dulu."
mkdir -p "$APP_DIR"
rsync -a --delete \
  --exclude=node_modules --exclude=.next --exclude=.git \
  --exclude=uploads --exclude=backups --exclude=.env \
  "${SOURCE_DIR}/" "${APP_DIR}/"
# IMPORTANT: chown DULU sebelum membuat folder sebagai user noblekase.
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo -u "$APP_USER" mkdir -p "${APP_DIR}/uploads" "${APP_DIR}/backups"

log "==> Phase 9: Setup PostgreSQL database"
DB_PASS_FILE="/root/.noblekase-dbpass"
if [[ -f "$DB_PASS_FILE" ]]; then
  DB_PASS=$(cat "$DB_PASS_FILE")
  log "Re-use password DB existing dari $DB_PASS_FILE"
else
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
  echo "$DB_PASS" > "$DB_PASS_FILE"
  chmod 600 "$DB_PASS_FILE"
  log "Generated DB password (disimpan di $DB_PASS_FILE)"
fi

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O "$DB_USER" -E UTF8 "$DB_NAME"

log "==> Phase 10: .env file"
ENV_FILE="${APP_DIR}/.env"
if [[ -f "$ENV_FILE" ]]; then
  log ".env sudah ada — tidak ditimpa. Periksa manual."
else
  PAYLOAD_SECRET=$(openssl rand -base64 32)
  cat > "$ENV_FILE" <<EOF
# ============================================
# Noblekase — Generated by deploy-native.sh
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# ============================================

# CORE
NEXT_PUBLIC_SITE_URL=http://72.60.74.202:${APP_PORT}
SERVER_URL=http://72.60.74.202:${APP_PORT}
NEXT_PUBLIC_DEFAULT_LOCALE=id
PAYLOAD_SECRET=${PAYLOAD_SECRET}

# DATABASE
DATABASE_URI=postgres://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}

# REDIS
REDIS_URL=redis://127.0.0.1:6379

# UPLOADS
UPLOAD_DIR=${APP_DIR}/uploads

# OPTIONAL — isi nanti
GROQ_API_KEY=
GROQ_MODEL_CHATBOT=llama-3.1-8b-instant
GROQ_MODEL_MARKET_INTEL=llama-3.3-70b-versatile
GROQ_MODEL_BLOG=llama-3.3-70b-versatile
AI_BUDGET_CAP_USD=30
RESEND_API_KEY=
EMAIL_FROM=noreply@noblekase.com
EMAIL_REPLY_TO=halo@noblekase.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# RATE LIMITING
RATE_LIMIT_PUBLIC=120
RATE_LIMIT_SEARCH=60
RATE_LIMIT_AI_CHAT=20
RATE_LIMIT_AI_ADMIN=10

# FEATURE FLAGS
FEATURE_AI_CHATBOT=true
FEATURE_AI_MARKET_INTEL=true
FEATURE_AI_BLOG_DRAFT=true
FEATURE_AI_AUTO_TRANSLATE=true
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  log ".env dibuat. Isi GROQ_API_KEY/RESEND_API_KEY nanti via: sudo -u ${APP_USER} nano ${ENV_FILE}"
fi

log "==> Phase 11: Firewall"
ufw allow 22/tcp >/dev/null
ufw allow ${APP_PORT}/tcp >/dev/null
yes | ufw enable >/dev/null
ufw status

log "==> Phase 12: Install deps & build"
cd "$APP_DIR"
if [[ -f "${APP_DIR}/pnpm-lock.yaml" ]]; then
  log "pnpm-lock.yaml ditemukan — install dengan --frozen-lockfile (reproducible)."
  sudo -u "$APP_USER" pnpm install --frozen-lockfile
else
  warn "pnpm-lock.yaml TIDAK ada — install tanpa frozen-lockfile. Lockfile akan di-generate."
  warn "Setelah deploy berhasil, commit ${APP_DIR}/pnpm-lock.yaml ke repo untuk reproducible build."
  sudo -u "$APP_USER" pnpm install
fi
sudo -u "$APP_USER" pnpm build

log "==> Phase 13: Start via PM2"
sudo -u "$APP_USER" pm2 delete noblekase 2>/dev/null || true
sudo -u "$APP_USER" pm2 start "${APP_DIR}/ecosystem.config.cjs"
sudo -u "$APP_USER" pm2 save

# Daftar PM2 ke systemd. Karena script sudah jalan sebagai root,
# pm2 startup langsung membuat unit /etc/systemd/system/pm2-${APP_USER}.service.
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "$APP_DIR" \
  || warn "pm2 startup gagal. Jalankan manual: env PATH=\$PATH:/usr/bin pm2 startup systemd -u ${APP_USER} --hp ${APP_DIR}"
systemctl enable "pm2-${APP_USER}" 2>/dev/null || true
systemctl start  "pm2-${APP_USER}" 2>/dev/null || true

log "==> Phase 14: Verifikasi"
sleep 3
if curl -sf -o /dev/null -w "%{http_code}" "http://127.0.0.1:${APP_PORT}" | grep -qE '^(200|301|302|307|308)'; then
  log "App responding on port ${APP_PORT} ✓"
else
  warn "App belum respon di port ${APP_PORT}. Cek: sudo -u ${APP_USER} pm2 logs noblekase --lines 100"
fi

cat <<DONE

==================================================
✓ Deploy selesai

  URL publik   : http://72.60.74.202:${APP_PORT}
  Admin CMS    : http://72.60.74.202:${APP_PORT}/admin
  DB password  : $(cat ${DB_PASS_FILE})
                 (disimpan di ${DB_PASS_FILE})

  PM2 status   : sudo -u ${APP_USER} pm2 status
  PM2 logs     : sudo -u ${APP_USER} pm2 logs noblekase
  Reload app   : sudo -u ${APP_USER} pm2 reload noblekase

  Next steps:
    1. Buka /admin di browser & buat Super Admin pertama
    2. Edit ${APP_DIR}/.env untuk isi GROQ_API_KEY / RESEND_API_KEY
    3. Setup cron backup:
         crontab -u ${APP_USER} -e
         0 2 * * * ${APP_DIR}/scripts/backup-native.sh >> ${LOG_DIR}/backup.log 2>&1

  Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
==================================================
DONE
