import { FastifyInstance } from "fastify";
import { searchController } from "./books.controller";

export const bookRoutes = async (app: FastifyInstance) => {
  app.get("/search", async (request, reply) => {
    return await searchController(request, reply);
  });
};