declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<void>,
    
  }
}
import { FastifyInstance } from "fastify";
import {  createUser,  validateLoginCredentials,} from "@/controllers/user_controllers";
import { sendSuccess } from "@/utils/http/successResponses";
import cors from "@fastify/cors";
import {
  AppError,
  sendError,
  validateLoginForm,
  validateRegisterForm,
} from "@/utils/http/errorResponses";
import dotenv from "dotenv";
import { FastifyRequest } from "fastify/types/request";
import { FastifyJWT } from "@fastify/jwt";

dotenv.config()

export const userRoutes = async (app: FastifyInstance) => {
  app.register(cors, {
    origin: "https://localhost:5173",
    methods: ["POST", "GET", "PATCH", "DELETE"],
    credentials: true
  });


//  Middleware to check if JWT is valid
  app.decorate("authenticate", async (request: FastifyRequest, _) => {

    try {
      await request.jwtVerify();
            const user = request.user.role
      console.log("Rol del usuario:", user);

      
    } catch (err) {
      throw new AppError("UNAUTHORIZED");
    }
  });

  app.post("/register", {}, async (request, reply) => {
    try {
      const registerData = validateRegisterForm(request.body);
      await createUser(registerData);
      return sendSuccess(reply, "USER_CREATED");
    } catch (error) {
      if (error instanceof AppError) {
        return sendError(reply, error);
      } else {
        return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"))
      }
    }
  });

  app.post("/login", {}, async (request, reply) => {
    try {
      const loginData = validateLoginForm(request.body);
      const validUser = await validateLoginCredentials(loginData);
      if (validUser) {
        const accessToken = app.jwt.sign(
          { userId: validUser.id,
            userName: validUser.name,
            userEmail: validUser.email,
            role: validUser.role
          },
          { expiresIn: "1h" }
        )

        const refreshToken = app.jwt.sign(
          {
            userId: validUser.id,
            userName: validUser.name,
            userEmail: validUser.email,
            role: validUser.role
          },
          {expiresIn: "7d"}
        )

        reply.setCookie("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite:"none",
          path: "/",
          maxAge: 60 * 60,
        })
        reply.setCookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite:"none",
          path: "/",
          maxAge: 60 * 60 * 24 * 7
        })

        return sendSuccess(reply, "LOGIN_SUCCESS");
      } else {
        throw new AppError("INVALID_CREDENTIALS");
      }
    } catch (error) {
      if (error instanceof AppError) {
        return sendError(reply, error);
      }
      return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"))

    }
  })

  app.post("/logout", async (_, reply) => {
    reply.clearCookie("access_token", { 
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none"
       });
    
      reply.clearCookie("refresh_token", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      });


    return sendSuccess(reply, "LOGOUT_SUCCESS");
  });

  app.post("/refresh", async (request, reply) => {
  try {
    const refreshToken = request.cookies.refresh_token;
    if (!refreshToken) throw new AppError("UNAUTHORIZED");

    // Ahora TypeScript sabe qué hay dentro del payload:
    const payload = app.jwt.verify<FastifyJWT['payload']>(refreshToken);

    const newAccessToken = app.jwt.sign(
      {
        userId:payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        role: payload.role,
      },
      { expiresIn: "1h" }
    );

    reply.setCookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60,
    });

    return sendSuccess(reply, "TOKEN_REFRESHED");
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(reply, error);
    }
    return sendError(reply, new AppError("INVALID_TOKEN"));
  }
});

  
  // Rutas protegidas (solo accesibles para usuarios autenticados)
  app.get("/protected", { preHandler: [app.authenticate] }, async (request, reply) => {
     try{
      return sendSuccess(reply, "VALID_TOKEN", {user: request.user})
    }
    catch(error){
      if (error instanceof AppError){
       return sendError(reply, error)
      }
      return sendError(reply, new AppError("INTERNAL_SERVER_ERROR"))
    }    
  });

};



