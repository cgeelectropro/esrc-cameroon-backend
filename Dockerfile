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

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
COPY tsconfig*.json ./

RUN npx prisma generate

EXPOSE 4000
CMD ["node", "-e", "require('tsconfig-paths').register({baseUrl:'./dist/src',paths:{'@/*':['*']}});require('./dist/src/main');"]
