import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    // 🔐 Este es el tipo de datos que tú guardas en el token
    payload: {
      userId: number;
      userName: string;
      userEmail: string;
      role: string;
    };
    // 🔐 Este es el tipo del usuario una vez decodificado (request.user)
    user: {
      userId: number;
      userName: string;
      userEmail: string;
      role: string;
    };
  }
}
