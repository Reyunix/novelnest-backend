import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError, sendError } from "@/utils/http/errorResponses";
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

export const RegisterController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await createUser(request.body);
    return sendSuccess(reply, "USER_CREATED");
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};

export const LoginController = async (
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance,
) => {
  try {
    const validUser = await validateLoginCredentials(request.body);

    const payload = buildJwtPayload(validUser);
    const tokens = signAuthTokens(app, payload);
    setAuthCookies(reply, tokens);

    return sendSuccess(reply, "LOGIN_SUCCESS", { user: validUser });
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};

export const LogoutController = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    clearAuthCookies(reply);
    return sendSuccess(reply, "LOGOUT_SUCCESS");
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};

export const RefreshController = async (
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance,
) => {
  try {
    const newAccessToken = refreshAccessToken(request.cookies.refresh_token, app);
    setAccessTokenCookie(reply, newAccessToken);
    return sendSuccess(reply, "TOKEN_REFRESHED");
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};

export const MeController = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    return sendSuccess(reply, "VALID_TOKEN", { user: request.user });
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"));
  }
};
