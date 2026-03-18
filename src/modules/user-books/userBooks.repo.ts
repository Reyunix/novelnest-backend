import { CreateUserBookInput } from "./userBooks.types";
import { AppError } from "@/utils/http/errorResponses";
import { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/database/db";
type PrismaDbOrTx = Pick<PrismaClient, "userBook">;

export const getUserBooks = async (userId: number) =>{
  return await db.userBook.findMany({where:{userId}})
}

export const saveUserBook = async (
  tx: PrismaDbOrTx,
  saveUserBook: CreateUserBookInput,
) => {
  const alreadyExists = await checkIfUserBookAlreadyExists(tx, saveUserBook);
  if (alreadyExists) throw new AppError("USERBOOK_ALREADY_SAVED");
  try {
    return await tx.userBook.create({ data: saveUserBook });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("USERBOOK_ALREADY_SAVED");
    }
    throw error;
  }
};

const checkIfUserBookAlreadyExists = async (
  tx: PrismaDbOrTx,
  saveUserBook: CreateUserBookInput,
) => {
  const providerBookId = saveUserBook.providerBookId;
  const userId = saveUserBook.userId;
  const provider = saveUserBook.provider;
  const userBook = await tx.userBook.findFirst({
    where: { userId, provider, providerBookId },
  });

  return userBook !== null;
};
