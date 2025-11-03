import { buildServer } from "./server.js";
import { loadConfig } from "./config.js";

// Validate environment variables on startup
const config = loadConfig();

buildServer().then((app) => app.listen({ port: config.port, host: "0.0.0.0" }));
