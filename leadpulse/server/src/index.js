import http from "node:http";
import { connectDb } from "./db.js";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { initSocket } from "./socket.js";

async function main() {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);

  const io = initSocket(server);
  app.locals.io = io;

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`LeadPulse API running on http://localhost:${config.port}`);
  });

  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log("\nShutting down...");
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
