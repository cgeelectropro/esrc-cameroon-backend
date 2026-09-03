FROM node:20-slim AS builder
WORKDIR /app
ARG CACHE_BUST=20260319_1
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# openssl: required by Prisma engine
# remaining packages: shared libs Puppeteer's bundled Chromium needs to launch
# (certificate PDF generation would otherwise fail at runtime with no build-time error)
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY tsconfig*.json ./

RUN npx prisma generate

EXPOSE 4000
# Migrations run as Render's preDeployCommand (render.yaml), not here — this
# CMD also runs every time a free-tier instance wakes from idle, and running
# `prisma migrate deploy` on every cold start (not just real deploys) was
# adding an extra DB round-trip to an already-slow wake-up.
CMD node -e "require('tsconfig-paths').register({baseUrl:'./dist/src',paths:{'@/*':['*']}});require('./dist/src/main');"
