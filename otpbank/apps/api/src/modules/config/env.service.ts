import { Injectable } from "@nestjs/common";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.coerce.number().default(900),
  JWT_REFRESH_TTL: z.coerce.number().default(604800),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: z.coerce.boolean().default(false),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  WEB_BASE_URL: z.string().default("http://localhost:3000"),
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  PASSWORD_MIN_LENGTH: z.coerce.number().default(12),
  ARGON2_MEMORY_COST: z.coerce.number().default(19456),
  ARGON2_TIME_COST: z.coerce.number().default(2),
  ARGON2_PARALLELISM: z.coerce.number().default(1),
  RISK_LARGE_TRANSFER_MINOR: z.coerce.bigint().default(25000000n),
  RISK_NEW_BENEFICIARY_MINOR: z.coerce.bigint().default(10000000n)
});

type Env = z.infer<typeof schema>;

@Injectable()
export class EnvService {
  private readonly env: Env = schema.parse(process.env);

  get apiPort() { return this.env.API_PORT; }
  get redisUrl() { return this.env.REDIS_URL; }
  get jwtAccessSecret() { return this.env.JWT_ACCESS_SECRET; }
  get jwtRefreshSecret() { return this.env.JWT_REFRESH_SECRET; }
  get jwtAccessTtl() { return this.env.JWT_ACCESS_TTL; }
  get jwtRefreshTtl() { return this.env.JWT_REFRESH_TTL; }
  get cookieSecure() { return this.env.COOKIE_SECURE; }
  get cookieDomain() { return this.env.COOKIE_DOMAIN; }
  get trustProxy() { return this.env.TRUST_PROXY; }
  get corsOrigins() { return this.env.CORS_ORIGINS.split(",").map((item) => item.trim()); }
  get webBaseUrl() { return this.env.WEB_BASE_URL; }
  get passwordMinLength() { return this.env.PASSWORD_MIN_LENGTH; }
  get argon2MemoryCost() { return this.env.ARGON2_MEMORY_COST; }
  get argon2TimeCost() { return this.env.ARGON2_TIME_COST; }
  get argon2Parallelism() { return this.env.ARGON2_PARALLELISM; }
  get rateLimitTtl() { return this.env.RATE_LIMIT_TTL; }
  get rateLimitMax() { return this.env.RATE_LIMIT_MAX; }
  get riskLargeTransferMinor() { return this.env.RISK_LARGE_TRANSFER_MINOR; }
  get riskNewBeneficiaryMinor() { return this.env.RISK_NEW_BENEFICIARY_MINOR; }
}
