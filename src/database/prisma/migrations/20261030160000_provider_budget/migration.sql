CREATE TABLE "ProviderUsage" (
  "provider" TEXT NOT NULL,
  "day" DATE NOT NULL,
  "count" INTEGER NOT NULL CHECK ("count" >= 0),
  CONSTRAINT "ProviderUsage_pkey" PRIMARY KEY ("provider", "day")
);
