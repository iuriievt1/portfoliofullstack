import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_REFRESH_SECRET: z.string().min(20),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),

  OTP_TTL_SECONDS: z.coerce.number().default(300),
  OTP_LENGTH: z.coerce.number().default(6),
  OTP_RATE_LIMIT_PER_PHONE_PER_HOUR: z.coerce.number().default(10),

  CORS_ORIGINS: z.string().default(""),

  CANCEL_FEE_CENTS: z.coerce.number().default(5000),
  CANCEL_FEE_DRIVER_SHARE_CENTS: z.coerce.number().default(2500),
  CANCEL_FEE_PLATFORM_SHARE_CENTS: z.coerce.number().default(2500),

  MATCH_RADIUS_METERS: z.coerce.number().default(5000),
  MATCH_MAX_DRIVERS: z.coerce.number().default(10),
  OFFER_EXPIRES_SECONDS: z.coerce.number().default(20),

  LOG_LEVEL: z.string().default("info")
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
