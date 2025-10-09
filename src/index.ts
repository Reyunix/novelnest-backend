import Fastify from "fastify";
import { bookRoutes } from "./routes/book";
import { rootRoutes } from "./routes/root";
import { userRoutes } from "./routes/user";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fs from "fs"

dotenv.config({ path: "./apps/backend/.env" });

const app = Fastify({
  https:{
    key: fs.readFileSync("/home/irrelevant/Documentos/programming/Proyectos/ssl/localhost+2-key.pem"),
    cert: fs.readFileSync("/home/irrelevant/Documentos/programming/Proyectos/ssl/localhost+2.pem")
  }
});

app.register(rootRoutes, { prefix: "/api/v1" });
app.register(bookRoutes, { prefix: "api/v1/books" });
app.register(userRoutes, { prefix: "api/v1/users" });
app.register(fastifyCookie);
app.register(fastifyJwt, {  secret: "SuperSecretKey",});

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
