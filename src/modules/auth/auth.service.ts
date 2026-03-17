import type { FastifyInstance } from "fastify";
import { checkIfLoginUserExists, checkIfUserExists } from "./auth.repo";
import { createUserWithDefaultLists } from "./auth.repo";
import { parseLoginForm, parseRegisterForm } from "./auth.schema";
import { comparePasswords } from "@/utils/hash";
import { AppError } from "@/utils/http/errorResponses";
import type { AuthSafeUser, JwtUserPayload } from "./auth.types";
import { TOKEN_CONSTANTS } from "./auth.constants";

export const createUser = async (rawData: unknown) => {
  const userData = parseRegisterForm(rawData);

  const { userAlreadyExists, emailAlreadyExists } =
    await checkIfUserExists(userData);
  if (userAlreadyExists) throw new AppError("USERNAME_ALREADY_EXISTS");

  if (emailAlreadyExists) throw new AppError("EMAIL_ALREADY_EXISTS");

  return await createUserWithDefaultLists(userData);
};

export const validateLoginCredentials = async (
  rawData: unknown,
): Promise<AuthSafeUser> => {
  const userData = parseLoginForm(rawData);
  const { userPassword, userEmail, userName } = userData;

  const identifier = userEmail || userName;
  if (!identifier)
    throw new AppError("INVALID_LOGIN_DATA", "Usuario o Correo obligatorios");

  const user = await checkIfLoginUserExists(identifier);
  if (!user) throw new AppError("INVALID_CREDENTIALS");

  const passwordIsValid = await comparePasswords(userPassword, user.password);
  if (!passwordIsValid) throw new AppError("INVALID_CREDENTIALS");

  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const refreshAccessToken = (
  refreshToken: string | undefined,
  app: FastifyInstance,
): string => {
  if (!refreshToken) throw new AppError("UNAUTHORIZED");

  try {
    const verifiedPayload = app.jwt.verify<JwtUserPayload>(refreshToken);

    const payload: JwtUserPayload = {
      userId: verifiedPayload.userId,
      userName: verifiedPayload.userName,
      userEmail: verifiedPayload.userEmail,
      role: verifiedPayload.role,
    };

    return app.jwt.sign(payload, {
      expiresIn: TOKEN_CONSTANTS.ACCESS_TOKEN_TTL_SECONDS,
    });
  } catch {
    throw new AppError("INVALID_TOKEN");
  }
};
