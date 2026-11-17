# ============================================================
# HealthCore Public Website — Dockerfile
#
# Self-contained build context: run docker build from ./uis/website
# ============================================================

# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

ARG NEXT_PUBLIC_TALENT_TRACKER_URL
ENV NEXT_PUBLIC_TALENT_TRACKER_URL=${NEXT_PUBLIC_TALENT_TRACKER_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# Stage 3: Runner (production)
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider http://localhost:3002/ 2>/dev/null || exit 1

CMD ["node", "server.js"]