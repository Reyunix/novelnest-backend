import { FastifyInstance } from "fastify";
import { FormatUrl } from "@/utils/FormatUrl";
import type { ApiResponse } from "@/schemas/bookApiSchema";
import { AppError, sendError } from "@/utils/http/errorResponses";

export const bookRoutes = async (app: FastifyInstance) => {
  app.get("/", async (request, reply) => {
    reply.header("access-control-allow-origin", "*")
    try {
      const { q } = request.query as { q: string };
      if (!q) throw new Error("'q' parameter is required for query requests");
      const query = encodeURIComponent(q.trim());
      const formatedUrl = FormatUrl(query);

      const response = await fetch(formatedUrl);
      if (!response.ok) {
        return sendError(reply, new AppError("EXTERNAL_API_ERROR"));
      } else {
        const data = (await response.json()) as ApiResponse;
        return data;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
      }
    }
  });
};
