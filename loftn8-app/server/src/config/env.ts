import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1),

  JWT_GUEST_SESSION_SECRET: z.string().min(20),
  JWT_USER_SECRET: z.string().min(20),
  JWT_STAFF_SECRET: z.string().min(20),

  COOKIE_DOMAIN: z.string().optional().or(z.literal("")).optional(),

  // ✅ Web Push (VAPID)
  VAPID_SUBJECT: z.string().optional(),      // например: "mailto:dev@loftn8.com"
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = typeof env;
