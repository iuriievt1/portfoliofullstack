import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { initRedis } from "./config/redis";
import { logger } from "./config/logger";
import { initSocket } from "./realtime/socket";

async function main() {
  await initRedis();

  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);

  server.listen(env.PORT, env.HOST, () => {
    logger.info({ host: env.HOST, port: env.PORT }, "VEZI backend started");
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  async function shutdown() {
    logger.info("Shutting down...");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
