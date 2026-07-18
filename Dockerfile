# =====================================
# Noblekase — Multi-stage Docker Build
# Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
# =====================================

# === Stage 1: Dependencies ===
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Use frozen lockfile jika tersedia (reproducible build untuk production)
# Fallback ke regular install jika lockfile belum ada (first-time setup)
RUN if [ -f pnpm-lock.yaml ]; then \
      echo "Using frozen lockfile..." && \
      pnpm install --frozen-lockfile; \
    else \
      echo "WARNING: No pnpm-lock.yaml found, generating fresh install (not reproducible)..." && \
      pnpm install --no-frozen-lockfile; \
    fi

# === Stage 2: Builder ===
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Install build deps for sharp
RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Mengaktifkan `output: "standalone"` di next.config.ts. Runner di bawah
# menjalankan .next/standalone/server.js, jadi tanpa flag ini build gagal.
ENV BUILD_STANDALONE=true

# ---------------------------------------------------------------------------
# Variabel NEXT_PUBLIC_* HARUS tersedia saat BUILD, bukan saat container jalan.
#
# Next menanamkan nilainya langsung ke bundle JavaScript pada tahap build.
# Menaruhnya hanya di `env_file` compose tidak berpengaruh apa pun — saat itu
# bundle sudah terlanjur dibuat. Dan karena .dockerignore mengecualikan .env,
# builder tidak pernah melihat berkas itu.
#
# Akibatnya bila dilewatkan: seluruh nilai jatuh ke http://localhost:3000,
# sehingga canonical, hreflang, sitemap, metadataBase, dan URL yang diajukan
# ke Google Indexing semuanya salah — situs tetap jalan, tapi SEO-nya rusak
# tanpa gejala yang kelihatan.
# ---------------------------------------------------------------------------
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}

# Gagalkan build lebih awal daripada menerbitkan situs dengan SEO yang salah.
RUN if [ -z "$NEXT_PUBLIC_SITE_URL" ]; then \
      echo "ERROR: NEXT_PUBLIC_SITE_URL wajib di-set saat build." >&2; \
      echo "Isi nilainya di .env, lalu jalankan: docker compose build" >&2; \
      exit 1; \
    fi

# src/payload-types.ts di-gitignore (di-generate, bukan dikomit) — tanpa
# langkah ini, `pnpm build` gagal di type-check dengan error
# "Cannot find module '@/payload-types'" pada file mana pun yang meng-import
# tipe Payload (mis. src/scripts/seedTranslations.ts).
RUN pnpm generate:types

# Import map Payload HARUS dibuat sebelum build — komponen admin kustom
# (Logo, Icon, PoweredBy) diresolusi lewat berkas ini. Sengaja tanpa `|| true`:
# kalau langkah ini gagal, panel admin akan rusak diam-diam di production.
RUN pnpm payload generate:importmap
RUN pnpm build

# === Stage 3: Runner (production) ===
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# sharp disalin manual: penelusuran dependency Next kerap melewatkan binary
# native ketika node_modules berupa symlink pnpm. Tanpa ini image berhasil
# ter-build tapi crash saat memproses gambar pertama.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp

# Folder upload — di-mount sebagai volume dari host (lihat docker-compose.yml).
# Dibuat di sini supaya izinnya benar bahkan saat volume belum ada.
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
