import { AppError } from "@/utils/http/errorResponses";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

// We need to declare the authenticate function in the FastifyInstance type so that we can use it in our routes without TypeScript errors
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: import("fastify").FastifyRequest,
      reply: import("fastify").FastifyReply,
    ) => Promise<void>;
  }
}

// Auth plugin function settings
const authPluginImpl: FastifyPluginAsync = async (app) => {
  app.decorate("authenticate", async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new AppError("UNAUTHORIZED"); // This will be caught in auth.controller
    }
  });
};

// Allows us to register this plugin globally in the app and have access to it in all routes and plugins without needing to import it everywhere
export const authPlugin = fp(authPluginImpl, {
  name: "auth-plugin",
});
