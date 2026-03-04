import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { AppError, sendError } from "@/utils/http/errorResponses";

const errorHandlerPluginImpl: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }

    request.log.error(error);
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  });
};

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, {
  name: "error-handler-plugin",
});
