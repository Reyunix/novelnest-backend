import { FastifyReply, FastifyRequest } from "fastify";
import { AppError, sendError } from "@/utils/http/errorResponses";
import { searchBooks, validateSearchQuery } from "./books.service";

export const searchController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const parsedQuery = validateSearchQuery(request.query);
    const books = await searchBooks(parsedQuery);

    return books;
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};
