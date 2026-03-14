import { db } from "@/database/db";
import { CreateUserBookInput } from "./userBooks.types";
import { AppError } from "@/utils/http/errorResponses";
import { Prisma } from "@prisma/client";

export const saveUserBook = async (saveUserBook: CreateUserBookInput) => {
  const bookAlreadyInList = await checkIfUserBookAlreadyExists(saveUserBook);
  if (bookAlreadyInList) throw new AppError("USERBOOK_ALREADY_IN_LIST");

  try {
    return await db.userBook.create({ data: saveUserBook });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("USERBOOK_ALREADY_IN_LIST");
    }
    throw error;
  }
};

const checkIfUserBookAlreadyExists = async (
  saveUserBook: CreateUserBookInput,
) => {
  const providerBookId = saveUserBook.providerBookId;
  const userId = saveUserBook.userId;
  const provider = saveUserBook.provider;
  const userBook = await db.userBook.findFirst({
    where: { userId, provider, providerBookId },
  });

  return userBook !== null;
};
