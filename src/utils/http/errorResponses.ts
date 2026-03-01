import { FastifyReply } from "fastify";
import { ErrorsCatalog } from "./responsesCatalogs";

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

export const sendError = (reply: FastifyReply, error: AppError) => {
  return reply.status(error.statusCode).send(error.errorResponse);
};

