import type { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";

// Cors plugin function settings
export const corsPluginImpl: FastifyPluginAsync = async (app) => {
  app.register(cors, {
    origin: "http://localhost:5173",
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true,
  });
};

// Allows us to register this plugin globally in the app and have access to it in all routes and plugins without needing to import it everywhere
export const corsPlugin = fp(corsPluginImpl, {
  name: "cors-plugin",
});