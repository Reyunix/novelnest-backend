import { FastifyReply } from "fastify";

export const SuccessCatalog = {
  USER_CREATED: {
    statusCode: 201,
    message: "Usuario creado correctamente",
    code: "USER_CREATED",
  },
  USER_DELETED: {
    statusCode: 200,
    message: "Usuario eliminado correctamente",
    code: "USER_DELETED",
  },
  PASSWORD_UPDATED: {
    statusCode: 200,
    message: "Contraseña actualizada correctamente",
    code: "PASSWORD_UPDATED",
  },
  USERNAME_UPDATED: {
    statusCode: 200,
    message: "Nombre de usuario actualizado correctamente",
    code: "USERNAME_UPDATED",
  },
  EMAIL_UPDATED: {
    statusCode: 200,
    message: "Correo actualizado correctamente",
    code: "EMAIL_UPDATED",
  },
  LOGIN_SUCCESS: {
    statusCode: 200,
    message: "Inicio de sesión exitoso",
    code: "LOGIN_SUCCESS",
  },
} as const;

export type SuccessKey = keyof typeof SuccessCatalog;

export const sendSuceess = (
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
