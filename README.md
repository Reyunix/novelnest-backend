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
- Public edition detail (`GET /api/v1/books/:provider/:providerBookId`)
- Community rating aggregates and paginated reviews (`GET /api/v1/books/:provider/:providerBookId/community`)
- Authenticated own review: `GET`, `PUT`, `DELETE /api/v1/books/:provider/:providerBookId/reviews/me`

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

## Error Handling Documentation

- Global Fastify error handler flow: https://github.com/Reyunix/novelnest/blob/main/docs/backend/error-handler.md

## Notes

- This backend is intended to be consumed by `novelnest-frontend`.
- Provider API keys stay in backend only (not in frontend env).

## Book detail and community

Run `bun run prisma:migrate:deploy` and `bun run prisma:generate` before starting the updated API. The `BookReview` migration adds public contributions without copying private `UserBook.rating` or `UserBook.review` values.

Each user can publish one contribution per provider and edition: an integer rating from 1 to 5, review text up to 5,000 characters, or both. PUT replaces the contribution; omitted fields are cleared. Public responses include the display name, content and timestamps, never the user's email or library. Deleting a library entry preserves the contribution; deleting the account cascades to its contributions.

Community queries accept `page` (default 1) and `limit` (default 10, maximum 40). Responses contain `average`, `ratingsCount`, `totalItems` (text reviews), `page`, `limit`, `totalPages` and `items`. Rating-only contributions count towards the average without appearing as empty reviews. Pages beyond the end are clamped to the final available page. The detail endpoint normalizes provider metadata and converts HTML descriptions to plain text.

Google Books is queried when creating a contribution, but existing contributions can be edited or removed during provider outages. Bibliography and community reads are independent.

## Checks

```sh
bun run typecheck
bun run test
bun run test:integration
```

The integration suite requires the migrated local PostgreSQL database. It creates isolated test accounts and removes those accounts and their dependent data in a `finally` block. Without `RUN_DB_TESTS=1`, the default test command skips database integration tests.

## Production build (Render)

```sh
bun install --frozen-lockfile
bun run build
```

The build generates `dist/index.js` for Node and resolves internal TypeScript aliases. Runtime packages, including the Prisma client and its native engine, remain external: `dist` is not a standalone executable. Install dependencies and generate Prisma in the destination environment rather than copying local `node_modules`.

For a Render Web Service with the backend repository as root:

- Build command: `bun install --frozen-lockfile && bun run build`.
- Start command: `bun run start:render` (applies migrations before starting Node).
- Health check: `/api/v1/healthz`.
- Environment: `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, `API_KEY_GOOGLE`, and `CORS_ORIGINS` with the exact HTTPS origin of the frontend. Render supplies `PORT`; the server binds to `0.0.0.0` by default.

Bun is available on Render when the repository contains `bun.lock`; see [Render's Bun configuration](https://render.com/docs/bun-version). For services with a separate pre-deploy migration command, use `bun run prisma:migrate:deploy` there and `bun run start` as the start command.

### Troubleshooting Prisma P1001 on Render

If `prisma generate` succeeds but `prisma migrate deploy` reports P1001, the deployment cannot reach the database host. Check the database's availability, verify that `DATABASE_URL` matches the current connection string in the Render dashboard, and confirm that the web service and database share the same account and region when using the internal URL. A stale URL, unavailable database or mismatched region must be resolved independently of the build scripts.

Keep the build command as `bun install --frozen-lockfile && bun run build`: generating Prisma alone does not generate `dist/index.js`. Use `bun run start:render` to apply migrations before starting, or the separate pre-deploy migration command on plans that support it. Moving migrations out of the build does not itself fix database connectivity.

For connection details, see [Render Postgres connections](https://render.com/docs/postgresql-creating-connecting). Never copy database credentials into frontend environment variables or public diagnostics.
