import type { FastifyInstance } from "fastify";
import { buildServer } from "./server.js";

const port = Number(process.env.PORT || 8080);
buildServer().then((app: FastifyInstance) => app.listen({ port, host: "0.0.0.0" }));
