import { FastifyInstance } from "fastify";
import {
  createUserBookController,
  getUserBooksController,
} from "./userBooks.controller";

export const userBooksRoutes = async (app: FastifyInstance) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    return await getUserBooksController(request, reply);
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    console.log("Received request to save book:", request.body);
    return await createUserBookController(request, reply);
  });

  app.delete(
    "/:bookId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return;
    },
  );
};
