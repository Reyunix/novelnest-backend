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
- Book search proxy to Google Books (`GET /api/v1/books/search?q=...`)

## Main Structure

- `src/modules/auth`: auth vertical slice
- `src/modules/books`: books search module
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
- `API_KEY` (Google Books)
- `BASE_URL`
- `URL_FIELD`
- `NODE_ENV`

Optional (production HTTPS setup only):
- `HTTPS_KEY`
- `HTTPS_CERT`

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
npm run db:up
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

## Notes

- This backend is intended to be consumed by `novelnest-frontend`.
- Google API key stays in backend only (not in frontend env).
