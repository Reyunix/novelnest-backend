# NovelNest Backend

Backend service for NovelNest (Goodreads-style app) built with Fastify + TypeScript + Prisma + PostgreSQL.

## Repositories
- Main (hub): https://github.com/Reyunix/novelnest
- Frontend: https://github.com/Reyunix/novelnest-frontend

## Tech Stack

- Bun
- Fastify
- Prisma + PostgreSQL
- JWT + HTTP-only cookies
- Zod

## Current Features

- User registration (`POST /api/v1/auth/register`)
- Login (`POST /api/v1/auth/login`)
- Logout (`POST /api/v1/auth/logout`)
- Access token refresh (`POST /api/v1/auth/refresh`)
- Session check (`GET /api/v1/auth/me`)
- Book search via provider adapter (`GET /api/v1/books/search`)

## Main Structure

- `src/modules/auth`: auth vertical slice
- `src/modules/books`: books search module
- `src/modules/books/adapters`: external books providers
- `src/modules/user-books`: user collection module
- `src/plugins`: global plugins (`auth`, `cors`, `jwt`)
- `src/database/prisma`: schema and migrations

## Requirements

- Bun
- Docker

## Environment Variables

File: `novelnest-backend/.env`

Common keys:
- `DATABASE_URL`
- `JWT_SECRET`
- `API_BOOKS_PROVIDER`
- `API_KEY_GOOGLE` (Google Books)
- `API_BASE_URL_GOOGLE`
- `API_VOLUME_FIELDS_GOOGLE`
- `NODE_ENV`

Optional (production HTTPS setup only):
- `HTTPS_KEY`
- `HTTPS_CERT`

## Books Provider Selection

Current provider selection is centralized in:

- `src/modules/books/adapters/index.ts`

Behavior:
- `API_BOOKS_PROVIDER=google` -> uses `GoogleBooksAdapter`
- invalid provider value -> `INVALID_BOOKS_PROVIDER`

## External API Validation Checks

Use this checklist after changing provider config, adapter code, or DTO mapping.

1. Valid provider check
- Set `API_BOOKS_PROVIDER=google`.
- Call `GET /api/v1/books/search?q=malaz`.
- Expected: `200` + internal books DTO response.

2. Invalid provider check
- Set `API_BOOKS_PROVIDER=invalid_provider`.
- Call `GET /api/v1/books/search?q=malaz`.
- Expected: `INVALID_BOOKS_PROVIDER` error.

3. Query validation check
- Call `GET /api/v1/books/search` without search terms.
- Expected: `INVALID_QUERY_PARAMETER` error.

4. DTO contract check
- Success response contains:
  - `provider`
  - `totalItems`
  - `page`
  - `limit`
  - `items[]` (internal fields)

## Local Dev Setup (current)

- Backend runs on: `http://localhost:3000`
- CORS origin: `http://localhost:5173`
- Cookies in dev should be:
  - `sameSite: "lax"`
  - `secure: false` (when `NODE_ENV=development`)

Important: use `localhost` consistently on frontend and backend.

## Install

```bash
bun install
```

## Database (dev)

From workspace root:

```bash
bun run db:up
```

From backend folder:

```bash
bun run prisma:db:push
bun run prisma:generate
```

## Run

```bash
bun run dev
```

## Useful Scripts

- `bun run dev`: watch mode
- `bun run start`: normal start
- `bun run studio`: Prisma Studio
- `bun run docker`: start backend docker services
- `bun run prisma:db:push`: sync schema
- `bun run prisma:generate`: generate Prisma client

## Auth Documentation

- Session check flow (`GET /api/v1/auth/me`): https://github.com/Reyunix/novelnest/blob/main/docs/backend/auth-me-flow.md

## Notes

- This backend is intended to be consumed by `novelnest-frontend`.
- Provider API keys stay in backend only (not in frontend env).
