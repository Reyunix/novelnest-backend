import { FastifyInstance } from "fastify";
import { searchController } from "./books.controller";
import { bookParamsSchema, communityQuerySchema } from "./community.schema";
import {
  getCommunity,
  getOwnReview,
  saveReview,
  removeReview,
} from "./community.service";
import { getBooksAdapter } from "./adapters";
import { AppError } from "@/utils/http/errorResponses";
import { sendSuccess } from "@/utils/http/successResponses";

const identity = (params: unknown) => {
  const parsed = bookParamsSchema.safeParse(params);
  if (!parsed.success) throw new AppError("INVALID_BOOK_PARAMS");
  return parsed.data;
};

export const bookRoutes = async (app: FastifyInstance) => {
  app.get("/:provider/:providerBookId", async (request, reply) => {
    const book = identity(request.params);
    return sendSuccess(
      reply,
      "BOOK_DETAIL",
      await getBooksAdapter(book.provider).getById(book.providerBookId),
    );
  });
  app.get("/:provider/:providerBookId/community", async (request, reply) => {
    const book = identity(request.params);
    const query = communityQuerySchema.safeParse(request.query);
    if (!query.success) throw new AppError("INVALID_BOOK_PARAMS");
    return sendSuccess(
      reply,
      "BOOK_COMMUNITY",
      await getCommunity(book, query.data.page, query.data.limit),
    );
  });
  app.get(
    "/:provider/:providerBookId/reviews/me",
    { preHandler: [app.authenticate] },
    async (request, reply) =>
      sendSuccess(
        reply,
        "BOOK_REVIEW",
        await getOwnReview(identity(request.params), request.user.userId),
      ),
  );
  app.put(
    "/:provider/:providerBookId/reviews/me",
    { preHandler: [app.authenticate] },
    async (request, reply) =>
      sendSuccess(
        reply,
        "BOOK_REVIEW_SAVED",
        await saveReview(
          identity(request.params),
          request.user.userId,
          request.body,
        ),
      ),
  );
  app.delete(
    "/:provider/:providerBookId/reviews/me",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      await removeReview(identity(request.params), request.user.userId);
      return sendSuccess(reply, "BOOK_REVIEW_DELETED", null);
    },
  );
  app.get("/search", async (request, reply) => {
    return await searchController(request, reply);
  });
};
