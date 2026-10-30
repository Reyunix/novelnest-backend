import { AppError } from "@/utils/http/errorResponses";
import { integerEnv } from "@/shared/config/limits";
import { reserveProviderCall } from "./providerBudget";

export const providerMetrics = {
  cacheHits: 0,
  reservations: 0,
  rejected: 0,
  failures: 0,
};
export const createProviderGateway = ({
  reserve = () => reserveProviderCall("google"),
  now = Date.now,
  maxEntries = integerEnv("PROVIDER_CACHE_ENTRIES", 200),
  concurrency = integerEnv("PROVIDER_CONCURRENCY", 2),
  timeoutMs = integerEnv("PROVIDER_TIMEOUT_MS", 10000),
} = {}) => {
  const cache = new Map<string, { value: unknown; expires: number }>();
  const pending = new Map<string, Promise<unknown>>();
  let active = 0;
  return {
    async load<T>(
      key: string,
      ttl: number,
      loader: (signal: AbortSignal) => Promise<T>,
    ): Promise<T> {
      const cached = cache.get(key);
      if (cached && cached.expires > now()) {
        cache.delete(key);
        cache.set(key, cached);
        providerMetrics.cacheHits++;
        return structuredClone(cached.value) as T;
      }
      cache.delete(key);
      const existing = pending.get(key);
      if (existing) return structuredClone(await existing) as T;
      if (active >= concurrency) {
        providerMetrics.rejected++;
        const error = new AppError("CATALOG_UNAVAILABLE");
        error.retryAfter = 2;
        throw error;
      }
      active++;
      const job = (async () => {
        try {
          await reserve();
          providerMetrics.reservations++;
          const signal = AbortSignal.timeout(timeoutMs);
          // The deadline also bounds body parsing/mapping, even if a loader ignores abort.
          const value = await new Promise<T>((resolve, reject) => {
            const abort = () => reject(new AppError("EXTERNAL_API_ERROR"));
            signal.addEventListener("abort", abort, { once: true });
            Promise.resolve()
              .then(() => loader(signal))
              .then(resolve, reject)
              .finally(() => signal.removeEventListener("abort", abort));
          });
          cache.set(key, {
            value: structuredClone(value),
            expires: now() + ttl,
          });
          while (cache.size > maxEntries)
            cache.delete(cache.keys().next().value!);
          return value;
        } catch (error) {
          providerMetrics.failures++;
          throw error;
        } finally {
          active--;
          pending.delete(key);
        }
      })();
      pending.set(key, job);
      return structuredClone(await job);
    },
  };
};
export const providerGateway = createProviderGateway();
