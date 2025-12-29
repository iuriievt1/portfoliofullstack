import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, "openapi.json"), "utf-8"));

export function createApp() {
  const app = express();

  app.use(pinoHttp());
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: config.CLIENT_ORIGIN,
      credentials: true
    })
  );

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
