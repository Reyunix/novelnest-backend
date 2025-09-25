import { FastifyInstance } from "fastify";
import { createUser, validateLoginCredentials } from "@/controllers/user_controllers";
import { sendSuceess } from "@/utils/http/successResponses";
import cors from "@fastify/cors";
import {
  AppError,
  sendError,
  validateLoginForm,
  validateRegisterForm,
} from "@/utils/http/errorResponses";

export const userRoutes = async (app: FastifyInstance) => {
  app.register(cors, {
    origin: "*",
    methods: ["POST"],
  });

  app.post("/register", {}, async (request, reply) => {

    try {
      const registerData = validateRegisterForm(request.body)
      await createUser(registerData);
      return sendSuceess(reply, "USER_CREATED");
    } catch (error) {
      if (error instanceof AppError) {
        console.log("APP ERROR**");
        return sendError(reply, error);
      } else {
        console.log("**Internal Error**");
        console.log(error);
        return reply.status(500).send("MyError: Server Internar Error");
      }
    }
  });

  app.post("/login", {}, async (request, reply) => {
    try {
      const loginData = validateLoginForm(request.body);
      const validateUser = await validateLoginCredentials(loginData)

    } catch (error){
      if (error instanceof AppError){
        return sendError(reply, error)
      }

    }
  });
};
