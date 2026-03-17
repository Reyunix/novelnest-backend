import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { sendSuccess } from "@/utils/http/successResponses";
import {
  createUser,
  refreshAccessToken,
  validateLoginCredentials,
} from "./auth.service";
import {
  buildJwtPayload,
  clearAuthCookies,
  setAccessTokenCookie,
  setAuthCookies,
  signAuthTokens,
} from "./auth.session";
import { TOKEN_CONSTANTS } from "./auth.constants";

export const MeController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  // If we are in this controller, it means the user is authenticated and request.user is populated by the auth plugin
  return sendSuccess(reply, "VALID_TOKEN", { user: request.user });
};

export const RegisterController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  await createUser(request.body);
  return sendSuccess(reply, "USER_CREATED");
};

export const LoginController = async (
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance,
) => {
  const validUser = await validateLoginCredentials(request.body);
  const payload = buildJwtPayload(validUser);
  const tokens = signAuthTokens(app, payload);
  setAuthCookies(reply, tokens);
  return sendSuccess(reply, "LOGIN_SUCCESS", { user: validUser });
};

export const LogoutController = async (
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  clearAuthCookies(reply);
  return sendSuccess(reply, "LOGOUT_SUCCESS");
};

export const RefreshController = async (
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance,
) => {
  const newAccessToken = refreshAccessToken(
    request.cookies[TOKEN_CONSTANTS.REFRESH_TOKEN_NAME],
    app,
  );
  setAccessTokenCookie(reply, newAccessToken);
  return sendSuccess(reply, "TOKEN_REFRESHED");
};

