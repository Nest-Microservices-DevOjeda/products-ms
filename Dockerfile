# ========================================
# Optimized Multi-Stage Dockerfile
# Node.js NestJS Application (Using pnpm)
# ========================================

# ---------- Base ----------
FROM node:20-alpine AS base

# System dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# ---------- Dependencies (prod only) ----------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# ---------- Build dependencies (dev + prod) ----------
FROM base AS build-deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- Build ----------
FROM build-deps AS build

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN pnpm run build

# ---------- Development ----------
FROM build-deps AS development

ENV NODE_ENV=development

WORKDIR /usr/src/app
COPY . .

# Expose app port (dev)
EXPOSE 3001

# Hot reload + Prisma + native deps
CMD ["sh", "-c", "pnpm rebuild better-sqlite3 && npx prisma migrate dev && pnpm start:dev"]

# ---------- Production ----------
FROM base AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Production deps
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Built app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma

# Expose app port (prod)
EXPOSE 3001

CMD ["node", "dist/main.js"]
