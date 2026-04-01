import { CreateUserBookInput, userBookStatusData } from "./userBooks.types";
import { AppError } from "@/utils/http/errorResponses";
import { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/database/db";
import type { UserBookStatus } from "./userBooks.schema";
type PrismaDbOrTx = Pick<PrismaClient, "userBook">;

export const getUserBooks = async (userId: number, status?: UserBookStatus) => {
  return await db.userBook.findMany({
    where: { userId, ...(status ? { status } : {}) },
  });
};

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

export const deleteUserBook = async (id: number, userId: number) => {
  try {
    await db.userBook.delete({ where: { id, userId } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("USERBOOK_NOT_FOUND");
    }
    throw error;
  }
};

export const updateUserBookStatus = async (
  tx: PrismaDbOrTx,
  { id, userId, status }: userBookStatusData,
) => {
  try {
    const updatedBook = tx.userBook.update({
      where: { id, userId },
      data: {
        status,
      },
    });
    return updatedBook;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("USERBOOK_NOT_FOUND");
    }
    throw error;
  }
};
