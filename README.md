# NovelNest Backend
Backend service for NovelNest (a Goodreads-style app) built with Fastify + TypeScript + Prisma + PostgreSQL.

## Tech Stack
- Bun
- Fastify
- Prisma + PostgreSQL
- JWT + HTTP-only cookies
- Zod validation

## Current Features
- User registration (`POST /api/v1/auth/register`)
- Login (`POST /api/v1/auth/login`)
- Logout (`POST /api/v1/auth/logout`)
- Access token refresh (`POST /api/v1/auth/refresh`)
- Session check (`GET /api/v1/auth/me`)
- Book search via Google Books API (`GET /api/v1/books/search?q=...`)

## Main Structure
- `src/modules/auth`: auth vertical slice (`routes/controller/service/repo/schema`)
- `src/modules/books`: book search module
- `src/plugins`: global plugins (`auth`, `cors`, `jwt`)
- `src/database/prisma`: schema and migrations

## Requirements
- Bun installed
- Docker (for PostgreSQL)
- Local HTTPS certs (mkcert)

## Environment Variables
File: `novelnest-backend/.env`

Required keys:
- `DATABASE_URL`
- `JWT_SECRET`
- `HTTPS_KEY`
- `HTTPS_CERT`
- `NODE_ENV`

## Install
```bash
bun install
```

## Database (dev)
From monorepo root:
```bash
bun run db:up
```

From backend folder:
```bash
bunx prisma migrate deploy --schema src/database/prisma/schema.prisma
bunx prisma generate --schema src/database/prisma/schema.prisma
```

## Run
```bash
bun run dev
```
Default server: `https://127.0.0.1:3000`

## Useful Scripts
- `bun run dev`: watch mode
- `bun run start`: normal start
- `bun run studio`: Prisma Studio
- `bun run docker`: start backend docker services

## Dev Notes
- CORS currently allows `https://localhost:5173`.
- `@fastify/jwt` reads token from cookie `access_token`.
- Stop DB from monorepo root:
```bash
bun run db:down
```
