import { FastifyInstance } from "fastify";
import { userBooksController } from "./userBooks.controller";

export const userBooksRoutes = async (app: FastifyInstance) => {
  app.get("/books", async (request, reply) => {
        return await userBooksController(request, reply);
  });

  app.post("/books", {preHandler:[app.authenticate]}, async (request, reply) => {
        console.log("Received request to save book:", request.body);
        return await userBooksController(request, reply);
  });

  app.delete("/books/:bookId", {preHandler:[app.authenticate]}, async (request, reply) => {
        return await userBooksController(request, reply);
  });

};
