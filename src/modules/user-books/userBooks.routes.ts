import { FastifyInstance } from "fastify";
import {
  createUserBookController,
  deleteUserBookController,
  getUserBooksController,
  updateUserBookStatusController,
} from "./userBooks.controller";

export const userBooksRoutes = async (app: FastifyInstance) => {
  app.get("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    return await getUserBooksController(request, reply);
  });

  app.post("/", { preHandler: [app.authenticate] }, async (request, reply) => {
    return await createUserBookController(request, reply);
  });

  app.delete(
    "/:bookId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await deleteUserBookController(request, reply);
    },
  );

  app.patch(
    "/:bookId/status",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return await updateUserBookStatusController(request, reply);
    },
  );
};
