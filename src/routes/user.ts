import { FastifyInstance } from "fastify";
import { RegisterFormSchema } from "@/schemas/registerFormSchema";
import { createUser } from "@/controllers/user_controllers";
import { sendSuceess } from "@/utils/http/successResponses";
import type { ErrorCode } from "@/utils/http/errorResponses";
import z from "zod";

import cors from "@fastify/cors";
import { AppError, sendError } from "@/utils/http/errorResponses";
import { LoginFormSchema } from "@/schemas/loginFormSchema";

export const userRoutes = async (app: FastifyInstance) => {
  app.register(cors, {
    origin: "*",
    methods: ["POST"],
  });
  app.post("/register", {}, async (request, reply) => {
    console.log("**endpoint --->> /register");
    const result = RegisterFormSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        message: "Invalid request body",
        error: result.error?.message,
      });
    }
    try {
      await createUser(result.data);
      return sendSuceess(reply, "USER_CREATED");
    } catch (error) {
      if (error instanceof AppError) {
        console.log("APP ERROR**");
        return sendError(reply, error.errorCode as ErrorCode);
      } else {
        console.log("**Internal Error**");
        console.log(error);
        return reply.status(500).send("MyError: Server Internar Error");
      }
    }
  });

  app.post("/login", {}, async (request, reply) => {
    const result = LoginFormSchema.safeParse(request.body);
    if (!result.success) {
      const formattedErrors = z.treeifyError(result.error);
      const messageError =
        formattedErrors.properties?.userName?.errors[0] ||
        formattedErrors.properties?.userEmail?.errors[0] ||
        formattedErrors.properties?.userPassword?.errors[0] ||
        "Datos Inválidos";
      return reply.status(400).send({
        success: false,
        error: "INVALID_FORM_DATA",
        message: messageError,
      });
    }
  });
};
