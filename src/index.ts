import { buildServer } from './server.js';

async function main() {
  const app = await buildServer();
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '0.0.0.0';
  
  try {
    await app.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
