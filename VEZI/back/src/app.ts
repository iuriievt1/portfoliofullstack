// src/app.ts
import express, { type RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { corsOrigins } from "./config/env";
import { logger } from "./config/logger";
import { apiLimiter } from "./middlewares/rateLimit";
import { routes } from "./routes";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/error";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  // ✅ типовой конфликт pino/pino-http → кастим
  app.use(pinoHttp({ logger: logger as any }) as unknown as RequestHandler);

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (corsOrigins.length === 0) return cb(null, true);
        return cb(null, corsOrigins.includes(origin));
      },
      credentials: true
    })
  );

  app.use(apiLimiter);

  app.use("/api", routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

