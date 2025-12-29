import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.CLIENT_ORIGIN, credentials: true }
});

// Simple org-scoped realtime channels
io.on("connection", (socket) => {
  socket.on("org:join", (orgId: string) => {
    if (typeof orgId === "string" && orgId.length > 0) socket.join(`org:${orgId}`);
  });
});

// Expose io via app locals
(app as any).locals.io = io;

server.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ level: 30, port: config.PORT, msg: "ChronoLedger API listening" }));
});
