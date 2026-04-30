import type { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import fp from "fastify-plugin";

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = (
  process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ??
  defaultAllowedOrigins
);

// Cors plugin function settings
export const corsPluginImpl: FastifyPluginAsync = async (app) => {
  app.register(cors, {
    origin: allowedOrigins,
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true,
  });
};

// Allows us to register this plugin globally in the app and have access to it in all routes and plugins without needing to import it everywhere
export const corsPlugin = fp(corsPluginImpl, {
  name: "cors-plugin",
});
