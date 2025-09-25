import { LoginFormSchema } from "@/schemas/loginFormSchema";
import { RegisterFormSchema } from "@/schemas/registerFormSchema";
import { FastifyReply } from "fastify";
import z from "zod";

export const ErrorsCatalog = {
  USER_NOT_FOUND: {
    statusCode: 404,
    errorCode: "USER_NOT_FOUND",
    message: "Usuario no encontrado",
  },
  USERNAME_ALREADY_EXISTS: {
    statusCode: 409,
    errorCode: "USERNAME_ALREADY_EXISTS",
    message: "El nombre de usuario ya está registrado",
  },
  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    errorCode: "EMAIL_ALREADY_EXISTS",
    message: "El correo ya está registrado",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    errorCode: "INVALID_CREDENTIALS",
    message: "El inicio de sesión o la contraseña son inválidos",
  },
  INVALID_LOGIN_DATA: {
    statusCode: 400,
    errorCode: "INVALID_LOGIN_DATA",
    message: "Campos de inicio de sesión incorrectos",
  },
    INVALID_REGISTER_DATA: {
    statusCode: 400,
    errorCode: "INVALID_REGISTER_DATA",
    message: "Campos de registro incorectos",
  },
} as const;

export type ErrorCode = keyof typeof ErrorsCatalog;
export type ErrorDefinition = (typeof ErrorsCatalog)[ErrorCode];
export type ErrorResponse = {
  success: false;
  error: ErrorCode;
  message: string;
};

export class AppError extends Error {
  public errorCode: string;
  public statusCode: number;
  public errorResponse: ErrorResponse;

  constructor(code: ErrorCode, customMessage?: string) {
    const { message, statusCode } = ErrorsCatalog[code];
    super(customMessage ?? message);
    this.name = "AppError";
    this.errorCode = code;
    this.statusCode = statusCode;
    this.errorResponse = {
      success: false,
      error: code,
      message: customMessage ?? message,
    };

    Object.setPrototypeOf(this, new.target.prototype);
  }
}


export const validateLoginForm = (data: unknown) => {
  const result = LoginFormSchema.safeParse(data);

  if (!result.success) {
    const formated = z.treeifyError(result.error);
    const firstMessage =
      formated.properties?.userName?.errors[0] ||
      formated.properties?.userEmail?.errors[0] ||
      formated.properties?.userPassword?.errors[0] ||
      "Datos inválidos";

    throw new AppError("INVALID_LOGIN_DATA", firstMessage);
  }
  return result.data
};

export const validateRegisterForm = (data: unknown) => {
  const result = RegisterFormSchema.safeParse(data);

  if (!result.success) {
    const formated = z.treeifyError(result.error);
    const firstMessage =
      formated.properties?.userName?.errors[0] ||
      formated.properties?.userEmail?.errors[0] ||
      formated.properties?.userPassword?.errors[0] ||
      formated.properties?.confirmPassword?.errors[0] ||
      formated.errors?.[0]
      "Datos inválidos";

    throw new AppError("INVALID_REGISTER_DATA", firstMessage);
  }
  return result.data
};

export const sendError = (reply: FastifyReply, error: AppError) => {
  return reply.status(error.statusCode).send(error.errorResponse);
};
