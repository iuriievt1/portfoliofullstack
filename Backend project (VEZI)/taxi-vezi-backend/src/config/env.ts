// src/config/env.ts
import "dotenv/config";

export const ENV = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: String(process.env.JWT_SECRET || "dev_secret_change_me"),
};
