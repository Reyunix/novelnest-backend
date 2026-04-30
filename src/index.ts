import Fastify from "fastify";
import { authRoutes } from "./modules/auth/auth.routes";
import { bookRoutes } from "./modules/books/books.routes";
import { userBooksRoutes } from "./modules/user-books/userBooks.routes";
import { rootRoutes } from "./modules/root/root";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import { authPlugin } from "./plugins/auth";
import { corsPlugin } from "./plugins/cors";
import { jwtPlugin } from "./plugins/jwt";
import { errorHandlerPlugin } from "./plugins/errorHandler";
import { userListsRoutes } from "./modules/user-lists/userLists.routes";

dotenv.config();

const app = Fastify();
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

//Plugins
app.register(errorHandlerPlugin)
app.register(fastifyCookie);
app.register(jwtPlugin);
app.register(authPlugin);
app.register(corsPlugin);

//Routes
app.register(rootRoutes, { prefix: "/api/v1" });
app.register(bookRoutes, { prefix: "/api/v1/books" });
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(userBooksRoutes, { prefix: "/api/v1/users/me/books" });
app.register(userListsRoutes, { prefix: "/api/v1/users/me/lists"})


app.listen({ port, host }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
