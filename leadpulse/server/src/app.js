import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.js";

// Load OpenAPI JSON via fs (works across Node versions)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "openapi.json"), "utf-8")
);

export function createApp() {
  const app = express();

  app.use(pinoHttp());

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true
    })
  );

  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 180,
      standardHeaders: "draft-7",
      legacyHeaders: false
    })
  );

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
