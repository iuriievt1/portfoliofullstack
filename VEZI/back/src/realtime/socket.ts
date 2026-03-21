import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../config/logger";

export let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: "*", credentials: true }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
      (socket as any).user = { id: payload.sub as string, role: payload.role as string };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as { id: string; role: string };
    socket.join(`user:${user.id}`);
    logger.info({ userId: user.id, role: user.role }, "Socket connected");

    socket.on("join_ride", (rideId: string) => {
      if (typeof rideId === "string" && rideId.length > 5) socket.join(`ride:${rideId}`);
    });

    socket.on("disconnect", () => {
      logger.info({ userId: user.id }, "Socket disconnected");
    });
  });
}
