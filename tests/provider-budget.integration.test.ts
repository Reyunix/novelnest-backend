import { describe, expect, test } from "bun:test";
import { PrismaClient } from "@prisma/client";
import { db } from "../src/database/db";
import { reserveProviderCall } from "../src/modules/books/adapters/providerBudget";
import { createProviderGateway } from "../src/modules/books/adapters/providerGateway";

describe.skipIf(process.env.RUN_DB_TESTS !== "1")(
  "durable provider budget on local PostgreSQL",
  () => {
    test("parallel reservations cannot exceed the cap, separate instances share it and UTC starts a fresh day", async () => {
      const provider = `test-${crypto.randomUUID()}`;
      const before = process.env.PROVIDER_DAILY_LIMIT;
      process.env.PROVIDER_DAILY_LIMIT = "7";
      const lastMinute = new Date("2026-10-30T23:59:59.000Z");
      try {
        const results = await Promise.allSettled(
          Array.from({ length: 30 }, () =>
            reserveProviderCall(provider, lastMinute),
          ),
        );
        expect(
          results.filter((result) => result.status === "fulfilled"),
        ).toHaveLength(7);
        expect(
          results.filter((result) => result.status === "rejected"),
        ).toHaveLength(23);
        expect(
          await db.providerUsage.findMany({ where: { provider } }),
        ).toMatchObject([{ count: 7 }]);
        const newInstance = createProviderGateway({
          reserve: () => reserveProviderCall(provider, lastMinute),
        });
        let sent = false;
        await expect(
          newInstance.load("new", 1000, async () => {
            sent = true;
          }),
        ).rejects.toMatchObject({
          errorCode: "CATALOG_QUOTA_EXCEEDED",
          retryAfter: 1,
        });
        expect(sent).toBe(false);
        await reserveProviderCall(
          provider,
          new Date("2026-10-31T00:00:00.000Z"),
        );
        expect(
          await db.providerUsage.findMany({
            where: { provider },
            orderBy: { day: "asc" },
          }),
        ).toMatchObject([{ count: 7 }, { count: 1 }]);
      } finally {
        if (before === undefined) delete process.env.PROVIDER_DAILY_LIMIT;
        else process.env.PROVIDER_DAILY_LIMIT = before;
        await db.providerUsage.deleteMany({ where: { provider } });
      }
    });
    test("database failure prevents new provider calls", async () => {
      const offline = new PrismaClient({
        datasources: {
          db: {
            url: "postgresql://unused:unused@127.0.0.1:1/unused?connect_timeout=1",
          },
        },
      });
      try {
        let sent = false;
        const gateway = createProviderGateway({
          reserve: () =>
            reserveProviderCall("test-offline", new Date(), offline),
        });
        await expect(
          gateway.load("test", 1000, async () => {
            sent = true;
          }),
        ).rejects.toMatchObject({ errorCode: "CATALOG_UNAVAILABLE" });
        expect(sent).toBe(false);
      } finally {
        await offline.$disconnect();
      }
    });
  },
);
