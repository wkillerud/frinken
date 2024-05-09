import path from "node:path";
import staticServer from "@fastify/static";
import { app } from "./src/main.js";

app.register(staticServer, {
	root: path.join(process.cwd(), "public"),
});

console.log("http://localhost:8080/");

app.listen({
	port: process.env.PORT ? Number.parseInt(process.env.PORT) : 8080,
});
