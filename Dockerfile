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

# Generate Payload import map then build
RUN pnpm payload generate:importmap || true
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

# Uploads directory (will be mounted as volume)
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
