import { FastifyReply } from "fastify";

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
  INVALID_CREDENTIALS:{
    statusCode: 401,
    errorCode: "INVALID_CREDENTIALS",
    message: "El inicio de sesión o la contraseña son inválidos"
  }
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

export const sendError = (reply: FastifyReply, key: ErrorCode) => {

  const statusCode = ErrorsCatalog[key].statusCode
  const message = ErrorsCatalog[key].message
  const errorCode = ErrorsCatalog[key].errorCode
  const errorResponse = {
    success:false,
    error: errorCode,
    message: message,
  }

  return reply.status(statusCode).send(errorResponse)

};
