#!/usr/bin/env bash
# =====================================
# Noblekase — Nightly Backup Script (Native, tanpa Docker)
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# =====================================
#
# Usage: cron sebagai user noblekase
#   crontab -u noblekase -e
#   0 2 * * * /opt/noblekase/scripts/backup-native.sh >> /var/log/noblekase/backup.log 2>&1
#
# Requires:
#   - pg_dump (sudah include di postgresql-16)
#   - Optional: gpg (encryption), rclone (upload R2)
# =====================================

set -euo pipefail

# === CONFIG ===
APP_DIR="/opt/noblekase"
BACKUP_LOCAL="${APP_DIR}/backups"
BACKUP_TMP="/tmp/noblekase-backup-$$"
DATE=$(date +%Y%m%d_%H%M%S)
DATE_DIR=$(date +%Y/%m)
RETENTION_DAYS_LOCAL=14
RCLONE_REMOTE="${RCLONE_REMOTE:-r2:noblekase-backup}"
GPG_PASSPHRASE="${BACKUP_GPG_PASSPHRASE:-}"

# === FUNCTIONS ===
log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }
cleanup() { rm -rf "$BACKUP_TMP"; }
trap cleanup EXIT

# === LOAD ENV ===
[[ -f "${APP_DIR}/.env" ]] || { log "ERROR: ${APP_DIR}/.env tidak ditemukan"; exit 1; }
# Source DATABASE_URI dari .env (single line, no spaces)
DATABASE_URI=$(grep -E '^DATABASE_URI=' "${APP_DIR}/.env" | cut -d= -f2- | tr -d '"')
[[ -n "$DATABASE_URI" ]] || { log "ERROR: DATABASE_URI kosong di .env"; exit 1; }

# === MAIN ===
log "Starting Noblekase backup (native)..."
mkdir -p "$BACKUP_TMP" "$BACKUP_LOCAL"

# 1. PostgreSQL dump (custom format, compressed)
log "Dumping PostgreSQL..."
pg_dump -Fc -d "$DATABASE_URI" -f "${BACKUP_TMP}/db_${DATE}.dump"
DB_SIZE=$(du -sh "${BACKUP_TMP}/db_${DATE}.dump" | cut -f1)
log "Database dump size: $DB_SIZE"

# 2. Uploads archive
if [[ -d "${APP_DIR}/uploads" ]]; then
  log "Archiving uploads..."
  tar -czf "${BACKUP_TMP}/uploads_${DATE}.tar.gz" -C "$APP_DIR" uploads/
  UPLOADS_SIZE=$(du -sh "${BACKUP_TMP}/uploads_${DATE}.tar.gz" | cut -f1)
  log "Uploads archive size: $UPLOADS_SIZE"
else
  log "Uploads folder kosong/tidak ada — skip."
  UPLOADS_SIZE="0"
fi

# 3. Optional encrypt
if [[ -n "$GPG_PASSPHRASE" ]] && command -v gpg >/dev/null 2>&1; then
  log "Encrypting backups (AES256)..."
  for file in "$BACKUP_TMP"/*.{dump,tar.gz}; do
    [[ -f "$file" ]] || continue
    echo "$GPG_PASSPHRASE" | gpg --batch --yes --passphrase-fd 0 \
      --symmetric --cipher-algo AES256 "$file"
    rm "$file"
  done
fi

# 4. Salin ke folder lokal (untuk retention pendek)
log "Copy ke ${BACKUP_LOCAL}..."
cp "$BACKUP_TMP"/* "$BACKUP_LOCAL/" 2>/dev/null || true

# Prune lokal lama
find "$BACKUP_LOCAL" -type f \( -name 'db_*' -o -name 'uploads_*' \) \
  -mtime +${RETENTION_DAYS_LOCAL} -delete

# 5. Upload R2 (jika rclone tersedia & configured)
if command -v rclone >/dev/null 2>&1 && rclone listremotes 2>/dev/null | grep -q "^${RCLONE_REMOTE%%:*}:"; then
  log "Uploading to ${RCLONE_REMOTE}/${DATE_DIR}/..."
  rclone copy "$BACKUP_TMP/" "${RCLONE_REMOTE}/${DATE_DIR}/" --transfers=2 || \
    log "WARN: rclone upload gagal — backup lokal masih tersimpan di ${BACKUP_LOCAL}"
else
  log "rclone tidak tersedia / belum dikonfigurasi — backup lokal saja."
fi

log "Backup complete: db=${DB_SIZE}, uploads=${UPLOADS_SIZE}"

# 6. Notify (opsional)
# if [[ -n "${TELEGRAM_TOKEN:-}" && -n "${TELEGRAM_CHAT_ID:-}" ]]; then
#   curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
#     -d "chat_id=${TELEGRAM_CHAT_ID}&text=Noblekase backup OK: ${DATE}"
# fi
