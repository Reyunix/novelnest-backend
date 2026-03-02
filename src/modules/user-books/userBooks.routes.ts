import { FastifyInstance } from "fastify";
import { userBooksController } from "./userBooks.controller";

export const userBooksRoutes = async (app: FastifyInstance) => {
  app.get("/books", async (request, reply) => {
        return await userBooksController(request, reply);
  });
};
