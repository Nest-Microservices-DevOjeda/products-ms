# ========================================
# Optimized Multi-Stage Dockerfile
# Node.js NestJS Application (Using pnpm)
# ========================================

FROM node:20-alpine AS base

# Install necessary system dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /usr/src/app

# ========================================
# Dependencies Stage
# ========================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# ========================================
# Build Dependencies Stage
# ========================================
FROM base AS build-deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# ========================================
# Build Stage
# ========================================
FROM build-deps AS build

# Copy source files
COPY . .

# Generate Prisma client (if applicable, usually needed before build)
RUN npx prisma generate

# Build the application
RUN pnpm run build

# ========================================
# Development Stage
# ========================================
FROM build-deps AS development

ENV NODE_ENV=development

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate
RUN pnpm rebuild better-sqlite3

# Expose port
EXPOSE 3001

# Start development server
CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start:dev"]

# ========================================
# Production Stage
# ========================================
FROM base AS production

ENV NODE_ENV=production

# Copy production dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./

# Expose port
EXPOSE 3001

# Start production server
CMD ["node", "dist/main"]
