import { providerMetrics } from "@/modules/books/adapters/providerGateway";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "@/utils/http/errorResponses";
import { integerEnv, allowedOrigins } from "@/shared/config/limits";

declare module "fastify" {
  interface FastifyInstance {
    enforceUserLimits: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}
const security: FastifyPluginAsync = async (app) => {
  const stats = setInterval(
    () => app.log.info({ event: "provider_usage", ...providerMetrics }),
    60000,
  );
  stats.unref();
  app.addHook("onClose", async () => {
    clearInterval(stats);
  });
  await app.register(rateLimit, { global: false, cache: 10000 });
  const limiter = (
    name: string,
    fallback: number,
    timeWindow = 60000,
    user = false,
  ) =>
    app.createRateLimit({
      max: integerEnv(name, fallback),
      timeWindow,
      keyGenerator: (request) =>
        `${name}:${user ? request.user.userId : request.ip}`,
    });
  type Check = ReturnType<typeof limiter>;
  const general = limiter("RATE_API_PER_MINUTE", 120);
  const search = limiter("RATE_SEARCH_PER_MINUTE", 20);
  const detail = limiter("RATE_DETAIL_PER_MINUTE", 40);
  const login = limiter("RATE_LOGIN_PER_MINUTE", 5);
  const register = limiter("RATE_REGISTER_PER_HOUR", 3, 3600000);
  const write = limiter("RATE_WRITE_PER_MINUTE", 30, 60000, true);
  const review = limiter("RATE_REVIEW_PER_MINUTE", 10, 60000, true);
  const enforce = async (
    check: Check,
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const result = await check(request);
    if (!result.isAllowed && result.isExceeded) {
      reply.header("Retry-After", Math.max(1, result.ttlInSeconds));
      app.log.info({ event: "rate_limit_rejected" });
      throw new AppError("RATE_LIMITED");
    }
  };
  app.addHook("onRequest", async (request, reply) => {
    if (
      request.method === "OPTIONS" ||
      (["GET", "HEAD"].includes(request.method) &&
        request.url.split("?")[0] === "/api/v1/healthz")
    )
      return;
    await enforce(general, request, reply);
    const route = request.routeOptions.url ?? "";
    if (route.endsWith("/auth/login")) await enforce(login, request, reply);
    if (route.endsWith("/auth/register"))
      await enforce(register, request, reply);
    if (route.endsWith("/books/search")) await enforce(search, request, reply);
    else if (
      request.method === "GET" &&
      route.endsWith("/:provider/:providerBookId")
    )
      await enforce(detail, request, reply);
    const cookieSession =
      request.cookies?.access_token || request.cookies?.refresh_token;
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
      cookieSession &&
      !allowedOrigins().includes(request.headers.origin ?? "")
    ) {
      app.log.info({ event: "origin_rejected" });
      throw new AppError("ORIGIN_NOT_ALLOWED");
    }
  });
  app.decorate(
    "enforceUserLimits",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
      await enforce(write, request, reply);
      if ((request.routeOptions.url ?? "").endsWith("/reviews/me"))
        await enforce(review, request, reply);
    },
  );
};
export const securityPlugin = fp(security, { name: "security-plugin" });
