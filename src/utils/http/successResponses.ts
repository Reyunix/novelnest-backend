import { FastifyReply } from "fastify";
import { SuccessCatalog } from "./responsesCatalogs";

export type SuccessKey = keyof typeof SuccessCatalog;

export const sendSuccess = (
  reply: FastifyReply,
  key: SuccessKey,
  data?: unknown
) => {
  const statusCode = SuccessCatalog[key].statusCode;
  const message = SuccessCatalog[key].message;
  const code = SuccessCatalog[key].code;
  const successResponse = {
    success: true,
    message,
    code,
    data,
  };
  return reply.status(statusCode).send(successResponse);
};