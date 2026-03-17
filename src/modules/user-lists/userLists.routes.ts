import { FastifyInstance } from "fastify";
import {
  getUserListByIdController,
  getDefaultUserListsController,
  getUserListsController,
} from "./userLists.controller";

export const userListsRoutes = (app: FastifyInstance) => {
  app.get(
    "/default",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return await getDefaultUserListsController(request, reply);
    },
  );

  app.get("/", { preHandler: app.authenticate }, async (request, reply) => {
    return await getUserListsController(request, reply);
  });

  app.get(
    "/:listId",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return await getUserListByIdController(request, reply);
    },
  );
};
