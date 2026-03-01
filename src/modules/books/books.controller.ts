import { FastifyReply, FastifyRequest } from "fastify";
import { AppError, sendError } from "@/utils/http/errorResponses";
import { fetchBooks, validateQuery } from "./books.service";

export const searchController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { q } = request.query as { q: string };
    const query = validateQuery(q);    
    const books = await fetchBooks(query);
    return books;

  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    } else {
      return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
    }
  }
};
