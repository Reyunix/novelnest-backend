-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('reading', 'completed', 'want_to_read', 'abandoned');

-- CreateTable
CREATE TABLE "UserBook" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "googleBookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT[],
    "thumbnail" TEXT,
    "canonicalVolumeLink" TEXT,
    "review" TEXT,
    "rating" INTEGER,
    "status" "BookStatus" NOT NULL DEFAULT 'want_to_read',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBook_userId_googleBookId_key" ON "UserBook"("userId", "googleBookId");

-- AddForeignKey
ALTER TABLE "UserBook" ADD CONSTRAINT "UserBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
