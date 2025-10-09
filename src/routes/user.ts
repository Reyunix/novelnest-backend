import { FastifyInstance } from "fastify";
import {  createUser,  validateLoginCredentials,} from "@/controllers/user_controllers";
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
    origin: "https://localhost:5173",
    methods: ["POST"],
    credentials: true
  });



  app.post("/register", {}, async (request, reply) => {
    try {
      const registerData = validateRegisterForm(request.body);
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
    console.log("Login endpoint")
    try {
      const loginData = validateLoginForm(request.body);
      const validUser = await validateLoginCredentials(loginData);
      if (validUser) {
        const token = app.jwt.sign(
          { userId: validUser.id,
            userName: validUser.name,
            userEmail: validUser.email
          },
          { expiresIn: "1h" }
        )

        reply.setCookie("access_token", token, {
          httpOnly: true,
          secure: true,  // CAMBIAR A TRUE EN PRODUCCIÓN
          sameSite:"none",
          path: "/",
          maxAge: 60 * 15,
        })

        return sendSuceess(reply, "LOGIN_SUCCESS");
      } else {
        throw new AppError("INVALID_CREDENTIALS");
      }
    } catch (error) {
      if (error instanceof AppError) {
        return sendError(reply, error);
      }
    }
  });
};
