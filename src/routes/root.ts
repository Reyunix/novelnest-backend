import { FastifyInstance } from "fastify";
import { checkDbConnection } from "@/repositories/test";
import { createUser } from "@/repositories/users_repo";

export const rootRoutes = (app: FastifyInstance) => {
  app.get("/", async (request, reply) => {
    return { message: "Hello from Fastify backend!" };
  });
};