export const integerEnv = (name: string, fallback: number, min = 1) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < min)
    throw new Error(`Invalid configuration: ${name}`);
  return value;
};
export const allowedOrigins = () =>
  (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
export const trustedProxies = () => {
  const value = process.env.TRUSTED_PROXY_CIDRS;
  if (!value) return false;
  const proxies = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (
    !proxies.length ||
    proxies.includes("0.0.0.0/0") ||
    proxies.includes("::/0")
  )
    throw new Error("TRUSTED_PROXY_CIDRS must identify specific proxies");
  return proxies;
};
