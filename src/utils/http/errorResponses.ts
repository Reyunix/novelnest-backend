import { LoginFormSchema } from "@/schemas/loginFormSchema";
import { RegisterFormSchema } from "@/schemas/registerFormSchema";
import { FastifyReply } from "fastify";
import { ErrorsCatalog } from "./responsesCatalogs";
import z from "zod";

export type ErrorCode = keyof typeof ErrorsCatalog;
// export type ErrorDefinition = (typeof ErrorsCatalog)[ErrorCode];
export type ErrorResponse = {
  success: false;
  errorCode: ErrorCode;
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
      errorCode: code,  
      message: customMessage ?? message,
    };

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const validateLoginForm = (data: unknown) => {
  const result = LoginFormSchema.safeParse(data);

  if (!result.success) {
    throw new AppError("INVALID_CREDENTIALS");
  }
  return result.data;
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
      formated.errors?.[0];
    ("Datos inválidos");

    throw new AppError("INVALID_REGISTER_DATA", firstMessage);
  }
  return result.data;
};
export const sendError = (reply: FastifyReply, error: AppError) => {
  return reply.status(error.statusCode).send(error.errorResponse);
};
