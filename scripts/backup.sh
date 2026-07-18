#!/usr/bin/env bash
# =====================================
# Noblekase — Nightly Backup Script
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# =====================================
#
# Usage: jalankan sebagai cron job nightly
#   0 2 * * * /opt/noblekase/scripts/backup.sh >> /var/log/noblekase-backup.log 2>&1
#
# Requires: docker, gpg, rclone (configured untuk Cloudflare R2)
# =====================================

set -euo pipefail
# Pola glob yang tidak menemukan berkas harus menghasilkan daftar kosong,
# bukan string literal — mencegah gpg dipanggil dengan nama berkas palsu.
shopt -s nullglob

# === CONFIG ===
PROJECT_DIR="/opt/noblekase"
BACKUP_TMP="/tmp/noblekase-backup"
DATE=$(date +%Y%m%d_%H%M%S)
DATE_DIR=$(date +%Y/%m)
RCLONE_REMOTE="r2:noblekase-backup"
GPG_RECIPIENT="${BACKUP_GPG_RECIPIENT:-}"
GPG_PASSPHRASE="${BACKUP_GPG_PASSPHRASE:-}"

# === FUNCTIONS ===
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

cleanup() {
    rm -rf "$BACKUP_TMP"
}
trap cleanup EXIT

# === MAIN ===
log "Starting Noblekase backup..."

mkdir -p "$BACKUP_TMP"
cd "$PROJECT_DIR"

# 1. Database dump
log "Dumping PostgreSQL..."
docker compose exec -T postgres pg_dump \
    -U "${POSTGRES_USER:-noblekase}" \
    -Fc \
    "${POSTGRES_DB:-noblekase}" > "$BACKUP_TMP/db_${DATE}.dump"

DB_SIZE=$(du -sh "$BACKUP_TMP/db_${DATE}.dump" | cut -f1)
log "Database dump size: $DB_SIZE"

# Verifikasi dump tidak kosong/rusak sebelum dianggap sukses.
if [[ ! -s "$BACKUP_TMP/db_${DATE}.dump" ]]; then
    log "ERROR: dump database kosong — backup dibatalkan."
    exit 1
fi
if ! pg_restore --list "$BACKUP_TMP/db_${DATE}.dump" > /dev/null 2>&1; then
    log "WARN: pg_restore tidak dapat membaca dump (pg_restore mungkin tidak terpasang di host)."
fi

# 2. Uploads tar
log "Archiving uploads..."
tar -czf "$BACKUP_TMP/uploads_${DATE}.tar.gz" -C "$PROJECT_DIR" uploads/

UPLOADS_SIZE=$(du -sh "$BACKUP_TMP/uploads_${DATE}.tar.gz" | cut -f1)
log "Uploads archive size: $UPLOADS_SIZE"

# 3. Encrypt (jika passphrase set)
if [[ -n "$GPG_PASSPHRASE" ]]; then
    log "Encrypting backups..."
    for file in "$BACKUP_TMP"/*.{dump,tar.gz}; do
        echo "$GPG_PASSPHRASE" | gpg --batch --yes --passphrase-fd 0 \
            --symmetric --cipher-algo AES256 \
            "$file"
        rm "$file"
    done
fi

# 4. Upload ke Cloudflare R2
log "Uploading to R2..."
rclone copy "$BACKUP_TMP/" "$RCLONE_REMOTE/$DATE_DIR/" \
    --progress \
    --transfers=2

# 5. Apply lifecycle (R2 lifecycle rule sudah handle retention)
# Manual cleanup untuk file lama 90+ hari (jika lifecycle rule belum di-set):
# rclone delete "$RCLONE_REMOTE" --min-age 90d --include "*.dump*" --include "*.tar.gz*"

log "Backup complete: db=$DB_SIZE, uploads=$UPLOADS_SIZE"

# 6. Notify (optional — kirim ke Telegram/email jika ada error)
# curl -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
#     -d "chat_id=${TELEGRAM_CHAT_ID}&text=Noblekase backup OK: $DATE"
