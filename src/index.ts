import { buildServer } from "./server.js";
const port = Number(process.env.PORT || 8080);
buildServer().then(app => app.listen({ port, host: "0.0.0.0" }));
