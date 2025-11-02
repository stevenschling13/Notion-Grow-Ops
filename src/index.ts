import { buildServer } from "./server.js";
import { loadConfig } from "./config.js";

const config = loadConfig();

buildServer(config)
  .then((app) => app.listen({ port: config.port, host: "0.0.0.0" }))
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
