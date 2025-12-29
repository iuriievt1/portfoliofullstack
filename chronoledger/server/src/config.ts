import { z } from "zod";
import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const boolFromEnv = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes";
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4010),
  DATABASE_URL: z.string().min(1),

  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().default(900),

  JWT_REFRESH_SECRET: z.string().min(10),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),

  COOKIE_SECURE: boolFromEnv.default(false),
  COOKIE_DOMAIN: z.string().optional().default(""),

  PUBLIC_INGEST_API_KEY: z.string().min(10)
});

export const config = envSchema.parse(process.env);
