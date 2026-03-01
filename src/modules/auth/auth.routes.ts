import { FastifyInstance } from "fastify";
import {
  LoginController,
  MeController,
  RefreshController,
  RegisterController,
  LogoutController,
} from "./auth.controller";

export const authRoutes = async (app: FastifyInstance) => {
  app.post("/register", {}, async (request, reply) => {
    return await RegisterController(request, reply);
  });

  app.post("/login", {}, async (request, reply) => {
    return await LoginController(request, reply, app);
  });

  app.post("/logout", async (request, reply) => {
    return await LogoutController(request, reply);
  });

  app.post("/refresh", async (request, reply) => {
    return await RefreshController(request, reply, app);
  });

  app.get("/me", { preHandler: [app.authenticate] }, async (request, reply) => {
    return await MeController(request, reply);
  });
};
