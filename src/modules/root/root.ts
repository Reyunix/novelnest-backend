import { FastifyInstance } from "fastify";

export const rootRoutes = (app: FastifyInstance) => {
  app.get("/", async () => {
    return { message: "Hello from Fastify backend!" };
  });
  app.get("/healthz", async () => {
    return { ok: true };
  });
};
