# ESRC Cameroon Backend

NestJS + TypeScript + Prisma API for the ESRC Cameroon platform.

## Prerequisites

- Node.js 20+
- PostgreSQL 15
- Redis 7

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database URL and secrets

# Start PostgreSQL + Redis (Docker)
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

API runs at http://localhost:4000
Swagger docs at http://localhost:4000/api/docs

## Project Structure

- `src/main.ts` - Bootstrap
- `src/config/` - Configuration
- `src/common/` - Guards, decorators, interceptors
- `src/modules/` - Feature modules (auth, courses, payments, etc.)
- `prisma/` - Database schema and migrations

## Environment Variables

See `.env.example` for all required variables.

## API Versioning

All endpoints are prefixed with `/api/v1/`.
