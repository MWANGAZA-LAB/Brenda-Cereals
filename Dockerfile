# Production Dockerfile for Brenda Cereals Web App
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/utils/package*.json ./packages/utils/

# Install root dependencies
RUN npm ci

# Install web app dependencies (including @tailwindcss/postcss)
WORKDIR /app/apps/web
RUN npm ci

# Install package dependencies
WORKDIR /app/packages/types
RUN npm ci

WORKDIR /app/packages/ui
RUN npm ci

WORKDIR /app/packages/utils
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependency files from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules

# Copy package files and source code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
COPY package*.json ./
COPY prisma/ ./prisma/

# Install package dependencies
WORKDIR /app
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build shared packages first
RUN echo "Building packages..." && ls -la packages/ui/node_modules/@types/ && npm run build:packages

# Build the Next.js application
WORKDIR /app/apps/web
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
