import { FastifyReply, FastifyRequest } from "fastify";
import { searchBooks, validateSearchQuery } from "./books.service";
import { sendSuccess } from "@/utils/http/successResponses";

export const searchController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {  
    const parsedQuery = validateSearchQuery(request.query);
    const books = await searchBooks(parsedQuery);

    return sendSuccess(reply, "BOOKS_SEARCH_SUCCESS", books);
};
