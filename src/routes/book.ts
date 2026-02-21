import { FastifyInstance } from "fastify";
import { FormatUrl } from "@/utils/FormatUrl";
import type { ApiResponse } from "@/schemas/bookApiSchema";

export const bookRoutes = async (app: FastifyInstance) => {
  app.get("/", async (request, reply) => {
    reply.header("access-control-allow-origin", "*")
    console.log("**endpoint api/v1/books**")
    try {
      const { q } = request.query as { q: string };
      if (!q) throw new Error("'q' parameter is required for query requests");
      const query = encodeURIComponent(q.trim());
      const formatedUrl = FormatUrl(query);

      const response = await fetch(formatedUrl);
      if (!response.ok) {
        return reply.status(400).send({ message: "Error en el fetch" });
      } else {
        const data = (await response.json()) as ApiResponse;
        return data;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return reply.status(500).send({ApiServerError: error.message});
      }
    }
  });
};
