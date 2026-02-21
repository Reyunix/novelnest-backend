import Fastify from "fastify";
import { bookRoutes } from "./routes/book";
import { rootRoutes } from "./routes/root";
import { userRoutes } from "./routes/user";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fs from "fs"
import { PathOrFileDescriptor } from "fs";


dotenv.config();

if (!process.env.JWT_SECRET) throw new Error("La variable de entorno JWT_SECRET no está definida")

const HTTPS_KEY = process.env.HTTPS_KEY;
const HTTPS_CERT = process.env.HTTPS_CERT


const app = Fastify({
  https:{
    key: fs.readFileSync(HTTPS_KEY as PathOrFileDescriptor),
    cert: fs.readFileSync(HTTPS_CERT as PathOrFileDescriptor)
  }
});
  
app.register(rootRoutes, { prefix: "/api/v1" });
app.register(bookRoutes, { prefix: "api/v1/books" });
app.register(userRoutes, { prefix: "api/v1/users" });
app.register(fastifyCookie);
app.register(fastifyJwt, {    
    secret: process.env.JWT_SECRET,
    cookie:{
      cookieName: "access_token",
      signed: false,      
    }
  })



app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
