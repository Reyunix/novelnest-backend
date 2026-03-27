import { FastifyReply, FastifyRequest } from "fastify";
import {
  createUserBook,
  UpdateAndSyncUserBookStatus,
  validateBodyUpdateUserBookStatus,
  validateParamsDeleteUserBook,
  validateParamsUpdateUserBookStatus,
  validateSaveUserBook,
} from "./userBooks.service";
import { sendSuccess } from "@/utils/http/successResponses";
import { deleteUserBook, getUserBooks } from "./userBooks.repo";

export const getUserBooksController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user.userId;
  const userBooks = await getUserBooks(userId);
  return sendSuccess(reply, "USERBOOKS_FOUND", userBooks);
};

export const createUserBookController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const parsedBook = validateSaveUserBook(request.body);
  const userId = request.user.userId;
  const userBook = await createUserBook(parsedBook, userId);
  return sendSuccess(reply, "BOOK_SAVED", userBook);
};

export const deleteUserBookController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user.userId;
  const parsed = validateParamsDeleteUserBook(request.params);
  await deleteUserBook(parsed.data.bookId, userId);
  return sendSuccess(reply, "BOOK_DELETED");
};

export const updateUserBookStatusController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user.userId;
  const validatedStatus = validateBodyUpdateUserBookStatus(request.body);
  const validatedBookId = validateParamsUpdateUserBookStatus(request.params);
  const id = validatedBookId.data.bookId;
  const status = validatedStatus.data.status;
  const updatedBook = await UpdateAndSyncUserBookStatus({ id, userId, status });
  return sendSuccess(reply, "BOOK_STATUS_UPDATED", updatedBook);
};
