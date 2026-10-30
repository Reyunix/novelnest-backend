import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { AppError, sendError } from "@/utils/http/errorResponses";

const errorHandlerPluginImpl: FastifyPluginAsync = async (app) => {
  app.setNotFoundHandler((_request, reply) =>
    sendError(reply, new AppError("ROUTE_NOT_FOUND")),
  );

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }

    if ((error as { statusCode?: number }).statusCode === 413)
      return sendError(reply, new AppError("PAYLOAD_TOO_LARGE"));
    request.log.error({ event: "request_failed" });
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  });
};

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, {
  name: "error-handler-plugin",
});
