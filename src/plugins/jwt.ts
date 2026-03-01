import { TOKEN_CONSTANTS } from "@/modules/auth/auth.constants";
import fastifyJwt from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const jwtPluginImpl: FastifyPluginAsync = async (app) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("La variable de entorno JWT_SECRET no está definida");
  }

  app.register(fastifyJwt, {
    secret,
    cookie: {
      cookieName: TOKEN_CONSTANTS.ACCESS_TOKEN_NAME,
      signed: false,
    },
  });
};

export const jwtPlugin = fp(jwtPluginImpl, {
  name: "jwt-plugin",
});
