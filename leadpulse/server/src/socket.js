import { Server } from "socket.io";
import { config } from "./config.js";

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigin,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ orgId }) => {
      if (!orgId) return;
      socket.join(`org:${orgId}`);
    });
  });

  return io;
}
