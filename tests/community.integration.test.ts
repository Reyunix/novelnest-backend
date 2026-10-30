import { describe, expect, test } from "bun:test";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import { authPlugin } from "../src/plugins/auth";
import { errorHandlerPlugin } from "../src/plugins/errorHandler";
import { bookRoutes } from "../src/modules/books/books.routes";
import { corsPlugin } from "../src/plugins/cors";
import { db } from "../src/database/db";

// Explicit opt-in: uses a local migrated database, creates isolated users and removes only those users.
describe.skipIf(process.env.RUN_DB_TESTS !== "1")(
  "community API with PostgreSQL",
  () => {
    test("ownership, upsert, aggregates, privacy, pagination, provider failure and cascading deletion", async () => {
      const app = Fastify();
      app.register(jwt, { secret: "isolated-integration-test-secret" });
      app.register(authPlugin);
      app.register(corsPlugin);
      app.register(errorHandlerPlugin);
      app.register(bookRoutes, { prefix: "/api/v1/books" });
      const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
      const users: number[] = [];
      const originalFetch = globalThis.fetch;
      let providerDown = false;
      let providerCalls = 0;
      globalThis.fetch = (async () => {
        providerCalls++;
        return providerDown
          ? new Response(null, { status: 503 })
          : Response.json({
              id: `test_${suffix}`,
              volumeInfo: { title: "Test edition" },
            });
      }) as typeof fetch;
      try {
        await app.ready();
        const preflight = await app.inject({
          method: "OPTIONS",
          url: "/api/v1/books/google/test/reviews/me",
          headers: {
            origin: "http://localhost:5173",
            "access-control-request-method": "PUT",
          },
        });
        expect(preflight.headers["access-control-allow-methods"]).toContain(
          "PUT",
        );
        for (let i = 0; i < 3; i++) {
          const user = await db.user.create({
            data: {
              name: `detail_${suffix}_${i}`,
              email: `detail_${suffix}_${i}@example.test`,
              password: "not-a-real-login",
            },
          });
          users.push(user.id);
        }
        const [a, b, c] = users as [number, number, number];
        const identity = {
          provider: "google",
          providerBookId: `test_${suffix}`,
        };
        const base = `/api/v1/books/google/${identity.providerBookId}`;
        const call = (
          method: "GET" | "PUT" | "DELETE",
          path: string,
          userId?: number,
          payload?: object,
        ) =>
          app.inject({
            method,
            url: base + path,
            ...(userId
              ? {
                  headers: {
                    authorization: `Bearer ${app.jwt.sign({ userId })}`,
                  },
                }
              : {}),
            ...(payload ? { payload } : {}),
          });
        await db.userBook.create({
          data: {
            userId: a,
            ...identity,
            title: "Private",
            authors: [],
            rating: 1,
            review: "Private old review",
          },
        });
        expect(
          (await call("PUT", "/reviews/me", undefined, { rating: 5 }))
            .statusCode,
        ).toBe(401);
        expect((await call("GET", "/community")).json().data).toMatchObject({
          average: null,
          ratingsCount: 0,
          totalItems: 0,
        });
        expect(
          (await call("PUT", "/reviews/me", a, { rating: 0 })).statusCode,
        ).toBe(400);
        const concurrent = await Promise.all([
          call("PUT", "/reviews/me", a, { rating: 5, text: "Public A" }),
          call("PUT", "/reviews/me", a, { rating: 5, text: "Public A" }),
        ]);
        expect(concurrent.map((response) => response.statusCode)).toEqual([
          200, 200,
        ]);
        expect(
          (await call("PUT", "/reviews/me", b, { rating: 3 })).statusCode,
        ).toBe(200);
        expect(
          (await call("PUT", "/reviews/me", c, { text: "Public C" }))
            .statusCode,
        ).toBe(200);
        let community = (await call("GET", "/community?limit=1")).json().data;
        expect(community).toMatchObject({
          average: 4,
          ratingsCount: 2,
          totalItems: 2,
          totalPages: 2,
          page: 1,
        });
        expect(community.items).toHaveLength(1);
        expect(Object.keys(community.items[0]).sort()).toEqual([
          "createdAt",
          "id",
          "rating",
          "text",
          "updatedAt",
          "user",
        ]);
        expect(Object.keys(community.items[0].user)).toEqual(["name"]);
        const secondPage = (
          await call("GET", "/community?limit=1&page=2")
        ).json().data;
        expect(secondPage.items[0].id).not.toBe(community.items[0].id);
        providerDown = true;
        const before = providerCalls;
        expect(
          (
            await call("PUT", "/reviews/me", a, {
              rating: 1,
              text: "Updated A",
            })
          ).statusCode,
        ).toBe(200);
        expect(providerCalls).toBe(before);
        expect((await call("GET", "/reviews/me", b)).json().data).toMatchObject(
          { rating: 3, text: null },
        );
        expect(
          (await call("PUT", "/reviews/me", a, { rating: 5, userId: b }))
            .statusCode,
        ).toBe(400);
        expect((await call("GET", "/community")).json().data.average).toBe(2);
        expect(await db.bookReview.count({ where: identity })).toBe(3);
        await db.userBook.deleteMany({ where: { userId: a } });
        expect((await call("GET", "/reviews/me", a)).json().data.text).toBe(
          "Updated A",
        );
        expect((await call("DELETE", "/reviews/me", c)).statusCode).toBe(200);
        expect(providerCalls).toBe(before);
        community = (await call("GET", "/community?limit=1&page=2")).json()
          .data;
        expect(community).toMatchObject({
          page: 1,
          totalPages: 1,
          totalItems: 1,
        });
        expect((await call("GET", "")).statusCode).toBe(502);
        expect((await call("GET", "/community")).statusCode).toBe(200);
        await db.user.delete({ where: { id: a } });
        expect((await call("GET", "/community")).json().data).toMatchObject({
          average: 3,
          ratingsCount: 1,
          totalItems: 0,
        });
        expect((await call("DELETE", "/reviews/me", b)).statusCode).toBe(200);
        expect((await call("DELETE", "/reviews/me", b)).statusCode).toBe(200);
        expect((await call("GET", "/community")).json().data).toMatchObject({
          average: null,
          ratingsCount: 0,
        });
      } finally {
        globalThis.fetch = originalFetch;
        await db.user.deleteMany({ where: { id: { in: users } } });
        await app.close();
        await db.$disconnect();
      }
    });
  },
);
