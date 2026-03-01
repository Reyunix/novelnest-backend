import Fastify from "fastify";
import { authRoutes } from "./modules/auth/auth.routes";
import { bookRoutes } from "./routes/book";
import { rootRoutes } from "./routes/root";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import fs from "fs";
import { PathOrFileDescriptor } from "fs";
import { authPlugin } from "./plugins/auth";
import { corsPlugin } from "./plugins/cors";
import { jwtPlugin } from "./plugins/jwt";

dotenv.config();

const HTTPS_KEY = process.env.HTTPS_KEY;
const HTTPS_CERT = process.env.HTTPS_CERT;

const app = Fastify({
  https: {
    key: fs.readFileSync(HTTPS_KEY as PathOrFileDescriptor),
    cert: fs.readFileSync(HTTPS_CERT as PathOrFileDescriptor),
  },
});


//Plugins
app.register(fastifyCookie);
app.register(jwtPlugin);
app.register(authPlugin);
app.register(corsPlugin);

//Routes
app.register(rootRoutes, { prefix: "/api/v1" });
app.register(bookRoutes, { prefix: "api/v1/books" });
app.register(authRoutes, { prefix: "api/v1/auth" });


app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});
