import { FastifyInstance } from "fastify";
import { createUserBookController } from "./userBooks.controller";

export const userBooksRoutes = async (app: FastifyInstance) => {
  app.get("/books", async (request, reply) => {
        return
  });

  app.post("/books", {preHandler:[app.authenticate]}, async (request, reply) => {
        console.log("Received request to save book:", request.body);
        return await createUserBookController(request, reply);
  });

  app.delete("/books/:bookId", {preHandler:[app.authenticate]}, async (request, reply) => {
        return
  });

};
