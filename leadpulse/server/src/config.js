import dotenv from "dotenv";
dotenv.config();

function req(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") throw new Error(`Missing env ${name}`);
  return v;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongodbUri: req("MONGODB_URI", "mongodb://localhost:27017/leadpulse"),
  clientOrigin: req("CLIENT_ORIGIN", "http://localhost:5173"),
  jwt: {
    accessSecret: req("JWT_ACCESS_SECRET"),
    refreshSecret: req("JWT_REFRESH_SECRET"),
    accessTtlMin: Number(process.env.ACCESS_TOKEN_TTL_MIN || 15),
    refreshTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7)
  },
  cookies: {
    secure: String(process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
    sameSite: process.env.COOKIE_SAMESITE || "lax"
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "LeadPulse <no-reply@leadpulse.local>"
  }
};
