CREATE TABLE "BookReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerBookId" TEXT NOT NULL,
    "rating" INTEGER,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BookReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BookReview_rating_check" CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5),
    CONSTRAINT "BookReview_text_check" CHECK ("text" IS NULL OR (length(btrim("text")) BETWEEN 1 AND 5000)),
    CONSTRAINT "BookReview_content_check" CHECK ("rating" IS NOT NULL OR "text" IS NOT NULL)
);
CREATE UNIQUE INDEX "BookReview_userId_provider_providerBookId_key" ON "BookReview"("userId", "provider", "providerBookId");
CREATE INDEX "BookReview_provider_providerBookId_createdAt_id_idx" ON "BookReview"("provider", "providerBookId", "createdAt", "id");
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
