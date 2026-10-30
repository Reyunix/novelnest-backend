import { db } from "@/database/db";
import { AppError } from "@/utils/http/errorResponses";
import { integerEnv } from "@/shared/config/limits";

export const reserveProviderCall = async (
  provider: string,
  now = new Date(),
  client: Pick<typeof db, "$queryRaw"> = db,
) => {
  const limit = integerEnv("PROVIDER_DAILY_LIMIT", 500, 0);
  const day = now.toISOString().slice(0, 10);
  const exhausted = () => {
    const error = new AppError("CATALOG_QUOTA_EXCEEDED");
    error.retryAfter = Math.max(
      1,
      Math.ceil(
        (Date.parse(`${day}T00:00:00Z`) + 86400000 - now.getTime()) / 1000,
      ),
    );
    return error;
  };
  if (limit === 0) throw exhausted();
  let rows: { count: number }[];
  try {
    rows = await client.$queryRaw<{ count: number }[]>`
      INSERT INTO "ProviderUsage" ("provider", "day", "count") VALUES (${provider}, ${day}::date, 1)
      ON CONFLICT ("provider", "day") DO UPDATE SET "count" = "ProviderUsage"."count" + 1
      WHERE "ProviderUsage"."count" < ${limit} RETURNING "count"`;
  } catch {
    throw new AppError("CATALOG_UNAVAILABLE");
  }
  if (!rows.length) throw exhausted();
};
