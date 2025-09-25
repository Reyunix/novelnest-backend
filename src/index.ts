import Fastify from "fastify";
import { bookRoutes } from "./routes/book";
import { rootRoutes } from "./routes/root";
import { userRoutes } from "./routes/user";
import dotenv from "dotenv"

dotenv.config({path: "./apps/backend/.env"})

const app = Fastify();

app.register(rootRoutes, {prefix: "/api/v1"});
app.register(bookRoutes, {prefix: "api/v1/books"});
app.register(userRoutes, {prefix: "api/v1/users"})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
