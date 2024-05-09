import { app } from "../src/main.js";

export default async function handler(req, reply) {
	await app.ready();
	app.server.emit("request", req, reply);
}
