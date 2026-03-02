import type { FastifyInstance, FastifyReply } from "fastify";
import type { AuthSafeUser, AuthTokens, JwtUserPayload } from "./auth.types";
import { TOKEN_CONSTANTS } from "./auth.constants";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const getCookieBaseOptions = () => ({
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
});

export const buildJwtPayload = (user: AuthSafeUser): JwtUserPayload => ({
  userId: user.id,
  userName: user.name,
  userEmail: user.email,
  role: user.role,
});

export const signAuthTokens = (
  app: FastifyInstance,
  payload: JwtUserPayload,
): AuthTokens => ({
  accessToken: app.jwt.sign(payload, { expiresIn: TOKEN_CONSTANTS.ACCESS_TOKEN_EXPIRATION }),
  refreshToken: app.jwt.sign(payload, { expiresIn: TOKEN_CONSTANTS.REFRESH_TOKEN_EXPIRATION }),
});

export const setAuthCookies = (reply: FastifyReply, tokens: AuthTokens): void => {
  const baseOptions = getCookieBaseOptions();

  reply.setCookie(TOKEN_CONSTANTS.ACCESS_TOKEN_NAME, tokens.accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  reply.setCookie(TOKEN_CONSTANTS.REFRESH_TOKEN_NAME, tokens.refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
};

export const setAccessTokenCookie = (
  reply: FastifyReply,
  accessToken: string,
): void => {
  const baseOptions = getCookieBaseOptions();

  reply.setCookie(TOKEN_CONSTANTS.ACCESS_TOKEN_NAME, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
};

export const clearAuthCookies = (reply: FastifyReply): void => {
  const baseOptions = getCookieBaseOptions();

  reply.clearCookie(TOKEN_CONSTANTS.ACCESS_TOKEN_NAME, baseOptions);
  reply.clearCookie(TOKEN_CONSTANTS.REFRESH_TOKEN_NAME, baseOptions);
};
