import { FastifyReply, FastifyRequest } from "fastify";
import { createUserBook, validateSaveUserBook } from "./userBooks.service";
import { sendSuccess } from "@/utils/http/successResponses";

export const createUserBookController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const parsedBook = validateSaveUserBook(request.body);
  const userId = request.user.userId;
  const userBook = await createUserBook(parsedBook, userId);
  return sendSuccess(reply, "BOOK_SAVED", userBook);
};
