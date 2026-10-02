#!/usr/bin/env bash
# =====================================
# Noblekase — Deploy produksi satu-perintah (Docker Compose).
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# =====================================
#
# Menyatukan langkah deploy yang berurutan menjadi satu skrip, supaya tidak
# perlu diketik manual di server. Idempoten & aman diulang.
#
# Pakai:
#   ./scripts/deploy.sh            # deploy / update rutin (build → migrasi → up)
#   ./scripts/deploy.sh --seed     # SEKALI di server baru: + seed konten & admin
#   ./scripts/deploy.sh --pull     # git pull --rebase dulu, lalu deploy
#
# Prasyarat: Docker + Docker Compose terpasang, dan berkas .env sudah diisi
# (lihat .env.example). DNS domain sudah menunjuk ke IP server (untuk HTTPS).
# =====================================

set -euo pipefail
cd "$(dirname "$0")/.."

# Compose v2 ("docker compose") atau v1 ("docker-compose").
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "ERROR: Docker Compose tidak ditemukan." >&2
  exit 1
fi

DO_SEED=false
DO_PULL=false
for arg in "$@"; do
  case "$arg" in
    --seed) DO_SEED=true ;;
    --pull) DO_PULL=true ;;
    *) echo "Argumen tak dikenal: $arg" >&2; exit 1 ;;
  esac
done

log() { echo -e "\n\033[1;34m▶ $*\033[0m"; }

# --- 0. Pemeriksaan awal --------------------------------------------------
if [[ ! -f .env ]]; then
  echo "ERROR: .env tidak ada. Salin dari .env.example dan isi dulu." >&2
  exit 1
fi
# NEXT_PUBLIC_SITE_URL wajib — ditanamkan ke bundle saat build (lihat Dockerfile).
if ! grep -q '^NEXT_PUBLIC_SITE_URL=.\+' .env; then
  echo "ERROR: NEXT_PUBLIC_SITE_URL belum diisi di .env." >&2
  exit 1
fi
# POSTGRES_PASSWORD wajib — dipakai menyusun DATABASE_URI di compose.
if ! grep -q '^POSTGRES_PASSWORD=.\+' .env; then
  echo "ERROR: POSTGRES_PASSWORD belum diisi di .env." >&2
  exit 1
fi

if $DO_PULL; then
  log "Menarik perubahan terbaru dari git"
  git pull --rebase
fi

# --- 1. Build image -------------------------------------------------------
log "Build image aplikasi"
$DC build

# --- 2. Nyalakan database & cache lebih dulu ------------------------------
log "Menyalakan PostgreSQL & Redis"
$DC up -d postgres redis

log "Menunggu PostgreSQL siap"
for i in $(seq 1 30); do
  if $DC exec -T postgres pg_isready -U "$(grep '^POSTGRES_USER=' .env | cut -d= -f2 || echo noblekase)" >/dev/null 2>&1; then
    echo "PostgreSQL siap."
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && { echo "ERROR: PostgreSQL tak kunjung siap." >&2; exit 1; }
done

# --- 3. Migrasi skema (selalu) --------------------------------------------
# Membangun/meng-update tabel. Aman diulang: migrasi yang sudah dijalankan
# dilewati. Di server BARU ini yang membuat seluruh tabel.
log "Menjalankan migrasi database"
$DC --profile tools run --rm tools pnpm payload migrate

# --- 4. Seed (opsional, untuk server baru) --------------------------------
if $DO_SEED; then
  log "Seed konten awal (server baru)"
  $DC --profile tools run --rm tools pnpm seed
  $DC --profile tools run --rm tools pnpm seed:content
  $DC --profile tools run --rm tools pnpm seed:translations

  log "Membuat akun admin pertama"
  echo "   (memakai ADMIN_EMAIL / ADMIN_PASSWORD dari .env)"
  $DC --profile tools run --rm tools pnpm create:admin
  echo -e "\n\033[1;33mPENTING: setelah ini, KOSONGKAN ADMIN_PASSWORD di .env.\033[0m"
fi

# --- 5. Nyalakan aplikasi & reverse proxy ---------------------------------
log "Menyalakan aplikasi & Caddy"
$DC up -d

log "Status"
$DC ps

echo -e "\n\033[1;32m✓ Deploy selesai.\033[0m"
cat <<'EOF'
Langkah manual yang masih perlu (sekali saja):
  1. Caddy menerbitkan sertifikat HTTPS otomatis — pantau: docker compose logs -f caddy
  2. Isi key LIVE Xendit & Biteship + alamat gudang di /admin
     (menu "API Keys & Integrasi" dan "Pengaturan Pengiriman").
  3. Daftarkan webhook di dashboard masing-masing:
       Xendit   → https://DOMAIN-ANDA/api/webhooks/xendit
       Biteship → https://DOMAIN-ANDA/api/webhooks/biteship?key=<BITESHIP_WEBHOOK_SECRET>
  4. Jalankan UAT: lihat docs/UAT-CHECKLIST.md
EOF
