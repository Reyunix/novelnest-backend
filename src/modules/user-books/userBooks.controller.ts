import { FastifyReply, FastifyRequest } from "fastify";
import { normalizeUserBook, validateSaveUserBook } from "./userBooks.service";
import { saveUserBook } from "./userBooks.repo";
import { sendSuccess } from "@/utils/http/successResponses";

export const userBooksController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {

  const parsedBook = validateSaveUserBook(request.body)
  const userId = request.user.userId
  const userBook = normalizeUserBook(parsedBook, userId)
  const savedBook = await saveUserBook(userBook)
  return sendSuccess(reply, "BOOK_SAVED", savedBook)

};
