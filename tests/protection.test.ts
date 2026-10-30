import { corsPlugin } from "../src/plugins/cors";
import { afterEach, expect, test } from "bun:test";
import Fastify from "fastify";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { securityPlugin } from "../src/plugins/security";
import { authPlugin } from "../src/plugins/auth";
import { errorHandlerPlugin } from "../src/plugins/errorHandler";
import { trustedProxies } from "../src/shared/config/limits";
import { createProviderGateway } from "../src/modules/books/adapters/providerGateway";
import { AppError } from "../src/utils/http/errorResponses";

const savedEnv = { ...process.env };
afterEach(() => {
  for (const key of Object.keys(process.env))
    if (!(key in savedEnv)) delete process.env[key];
  Object.assign(process.env, savedEnv);
});
const appForLimits = async () => {
  const app = Fastify({ bodyLimit: 32768, trustProxy: trustedProxies() });
  app.register(errorHandlerPlugin);
  app.register(cookie);
  app.register(jwt, {
    secret: "protection-test-only",
    cookie: { cookieName: "access_token", signed: false },
  });
  app.register(corsPlugin);
  app.register(securityPlugin);
  app.register(authPlugin);
  let executions = 0;
  const handler = async () => {
    executions++;
    return { ok: true };
  };
  app.register(async (routes) => {
    routes.get("/api/v1/books/search", handler);
    routes.get("/api/v1/books/:provider/:providerBookId", handler);
    routes.post("/api/v1/auth/login", handler);
    routes.post("/api/v1/auth/register", handler);
    routes.post(
      "/api/v1/users/me/books",
      { preHandler: [routes.authenticate] },
      handler,
    );
    routes.put(
      "/api/v1/books/google/test/reviews/me",
      { preHandler: [routes.authenticate] },
      handler,
    );
    routes.get("/api/v1/healthz", async () => ({ ok: true }));
    routes.options("/preflight", async () => ({ ok: true }));
  });
  await app.ready();
  return { app, executions: () => executions };
};
test("specific and general limits are additive, emit Retry-After and exclude health/preflight", async () => {
  process.env.RATE_API_PER_MINUTE = "3";
  process.env.RATE_SEARCH_PER_MINUTE = "1";
  const { app, executions } = await appForLimits();
  try {
    expect((await app.inject("/api/v1/books/search")).statusCode).toBe(200);
    const blocked = await app.inject({
      url: "/api/v1/books/search",
      headers: { origin: "http://localhost:5173" },
    });
    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
    expect(blocked.headers["access-control-expose-headers"]).toContain(
      "Retry-After",
    );
    expect(blocked.json().errorCode).toBe("RATE_LIMITED");
    expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
    expect((await app.inject("/api/v1/books/google/a")).statusCode).toBe(200);
    expect((await app.inject("/api/v1/books/google/b")).statusCode).toBe(429);
    expect(executions()).toBe(2);
    for (let i = 0; i < 5; i++) {
      expect((await app.inject("/api/v1/healthz")).statusCode).toBe(200);
      expect(
        (
          await app.inject({
            method: "OPTIONS",
            url: "/preflight",
            headers: {
              origin: "http://localhost:5173",
              "access-control-request-method": "GET",
            },
          })
        ).statusCode,
      ).toBe(204);
    }
  } finally {
    await app.close();
  }
});
test("forged forwarding headers cannot change identity without trusted proxy configuration", async () => {
  process.env.RATE_API_PER_MINUTE = "1";
  delete process.env.TRUSTED_PROXY_CIDRS;
  const { app } = await appForLimits();
  try {
    expect(
      (
        await app.inject({
          url: "/api/v1/books/search",
          headers: { "x-forwarded-for": "1.2.3.4" },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          url: "/api/v1/books/search",
          headers: { "x-forwarded-for": "9.8.7.6" },
        })
      ).statusCode,
    ).toBe(429);
  } finally {
    await app.close();
  }
});
test("authentication limits precede handlers; cookie writes reject missing or untrusted origins", async () => {
  process.env.RATE_LOGIN_PER_MINUTE = "1";
  process.env.RATE_REGISTER_PER_HOUR = "1";
  const { app } = await appForLimits();
  try {
    for (const path of ["login", "register"]) {
      expect(
        (await app.inject({ method: "POST", url: `/api/v1/auth/${path}` }))
          .statusCode,
      ).toBe(200);
      expect(
        (await app.inject({ method: "POST", url: `/api/v1/auth/${path}` }))
          .statusCode,
      ).toBe(429);
    }
    const token = app.jwt.sign({ userId: 42 });
    for (const origin of [undefined, "https://untrusted.test"]) {
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/api/v1/users/me/books",
            headers: {
              cookie: `access_token=${token}`,
              ...(origin ? { origin } : {}),
            },
          })
        ).statusCode,
      ).toBe(403);
    }
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/users/me/books",
          headers: { authorization: `Bearer ${token}` },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/users/me/books",
          headers: {
            cookie: `access_token=${token}`,
            origin: "http://localhost:5173",
          },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/users/me/books",
          headers: { "content-type": "application/json" },
          payload: JSON.stringify({ value: "x".repeat(33000) }),
        })
      ).statusCode,
    ).toBe(413);
  } finally {
    await app.close();
  }
});
test("per-user write and review limits are additive and isolated between accounts", async () => {
  process.env.RATE_WRITE_PER_MINUTE = "2";
  process.env.RATE_REVIEW_PER_MINUTE = "1";
  const { app } = await appForLimits();
  try {
    const headers = { authorization: `Bearer ${app.jwt.sign({ userId: 42 })}` };
    const review = {
      method: "PUT" as const,
      url: "/api/v1/books/google/test/reviews/me",
      headers,
    };
    expect((await app.inject(review)).statusCode).toBe(200);
    expect((await app.inject(review)).statusCode).toBe(429);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/users/me/books",
          headers,
        })
      ).statusCode,
    ).toBe(429);
    expect(
      (
        await app.inject({
          ...review,
          headers: { authorization: `Bearer ${app.jwt.sign({ userId: 43 })}` },
        })
      ).statusCode,
    ).toBe(200);
  } finally {
    await app.close();
  }
});
test("provider cache coalesces calls, clones cached values, expires entries and evicts LRU", async () => {
  let time = 0,
    reservations = 0,
    loads = 0;
  const gateway = createProviderGateway({
    now: () => time,
    maxEntries: 2,
    reserve: async () => {
      reservations++;
    },
  });
  const load = async () => {
    loads++;
    await Promise.resolve();
    return { value: loads };
  };
  const values = await Promise.all([
    gateway.load("a", 100, load),
    gateway.load("a", 100, load),
  ]);
  expect(values).toEqual([{ value: 1 }, { value: 1 }]);
  expect(reservations).toBe(1);
  values[0]!.value = 99;
  expect(await gateway.load("a", 100, load)).toEqual({ value: 1 });
  await gateway.load("b", 100, load);
  await gateway.load("a", 100, load);
  await gateway.load("c", 100, load);
  await gateway.load("b", 100, load);
  expect(loads).toBe(4);
  time = 101;
  await gateway.load("b", 100, load);
  expect(loads).toBe(5);
});
test("budget errors fail closed while cached content remains available", async () => {
  let unavailable = false,
    calls = 0;
  const gateway = createProviderGateway({
    reserve: async () => {
      if (unavailable) throw new AppError("CATALOG_QUOTA_EXCEEDED");
    },
  });
  const load = async () => ++calls;
  expect(await gateway.load("cached", 10000, load)).toBe(1);
  unavailable = true;
  expect(await gateway.load("cached", 10000, load)).toBe(1);
  await expect(gateway.load("new", 10000, load)).rejects.toMatchObject({
    errorCode: "CATALOG_QUOTA_EXCEEDED",
  });
  expect(calls).toBe(1);
});
test("concurrency rejection spends no budget; timeouts abort and are not cached", async () => {
  let reservations = 0;
  const gateway = createProviderGateway({
    reserve: async () => {
      reservations++;
    },
    concurrency: 1,
    timeoutMs: 15,
  });
  let aborted = false;
  const first = gateway.load(
    "slow",
    10000,
    (signal) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          aborted = true;
          reject(new Error("aborted"));
        });
      }),
  );
  await expect(
    gateway.load("other", 10000, async () => 2),
  ).rejects.toMatchObject({ errorCode: "CATALOG_UNAVAILABLE", retryAfter: 2 });
  await expect(first).rejects.toMatchObject({
    errorCode: "EXTERNAL_API_ERROR",
  });
  expect(aborted).toBe(true);
  expect(reservations).toBe(1);
  expect(await gateway.load("slow", 10000, async () => 3)).toBe(3);
  expect(reservations).toBe(2);
});

test("only configured connecting peers can supply forwarded client identities", async () => {
  process.env.RATE_API_PER_MINUTE = "1";
  process.env.TRUSTED_PROXY_CIDRS = "127.0.0.1/32";
  const { app } = await appForLimits();
  try {
    for (const ip of ["1.2.3.4", "9.8.7.6"]) {
      expect(
        (
          await app.inject({
            url: "/api/v1/books/search",
            remoteAddress: "127.0.0.1",
            headers: { "x-forwarded-for": ip },
          })
        ).statusCode,
      ).toBe(200);
    }
    expect(
      (
        await app.inject({
          url: "/api/v1/books/search",
          remoteAddress: "198.51.100.10",
          headers: { "x-forwarded-for": "1.1.1.1" },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          url: "/api/v1/books/search",
          remoteAddress: "198.51.100.10",
          headers: { "x-forwarded-for": "2.2.2.2" },
        })
      ).statusCode,
    ).toBe(429);
    process.env.TRUSTED_PROXY_CIDRS = "0.0.0.0/0";
    expect(() => trustedProxies()).toThrow();
  } finally {
    await app.close();
  }
});
