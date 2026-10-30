import { Prisma } from "@prisma/client";
import { db } from "@/database/db";
import { getBooksAdapter } from "./adapters";
import {
  reviewDtoSchema,
  communityDtoSchema,
  reviewInputSchema,
  type BookIdentity,
} from "./community.schema";
import { AppError } from "@/utils/http/errorResponses";

const publicSelect = {
  id: true,
  rating: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true } },
} as const;

export const getOwnReview = async (identity: BookIdentity, userId: number) =>
  reviewDtoSchema.nullable().parse(
    await db.bookReview.findUnique({
      where: { userId_provider_providerBookId: { userId, ...identity } },
      select: publicSelect,
    }),
  );

export const getCommunity = async (
  identity: BookIdentity,
  page: number,
  limit: number,
) => {
  return db.$transaction(
    async (tx) => {
      const summary = await tx.bookReview.aggregate({
        where: identity,
        _avg: { rating: true },
        _count: { rating: true },
      });
      const where = { ...identity, text: { not: null } };
      const totalItems = await tx.bookReview.count({ where });
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const actualPage = Math.min(page, totalPages);
      const items = await tx.bookReview.findMany({
        where,
        select: publicSelect,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (actualPage - 1) * limit,
        take: limit,
      });
      return communityDtoSchema.parse({
        average: summary._avg.rating,
        ratingsCount: summary._count.rating,
        totalItems,
        page: actualPage,
        limit,
        totalPages,
        items,
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
};

export const saveReview = async (
  identity: BookIdentity,
  userId: number,
  body: unknown,
) => {
  const input = reviewInputSchema.safeParse(body);
  if (!input.success) throw new AppError("INVALID_REVIEW");
  const own = await getOwnReview(identity, userId);
  if (!own)
    await getBooksAdapter(identity.provider).getById(identity.providerBookId);
  return reviewDtoSchema.parse(
    await db.bookReview.upsert({
      where: { userId_provider_providerBookId: { userId, ...identity } },
      create: { userId, ...identity, ...input.data },
      update: input.data,
      select: publicSelect,
    }),
  );
};

export const removeReview = async (identity: BookIdentity, userId: number) => {
  await db.bookReview.deleteMany({ where: { userId, ...identity } });
};
