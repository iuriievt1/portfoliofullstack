import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as { redis?: RedisClientType };

export function getRedis() {
  if (!process.env.REDIS_URL) return null;

  if (!globalForRedis.redis) {
    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Redis connection error", error);
      }
    });
    globalForRedis.redis = client;
  }

  return globalForRedis.redis;
}

export async function connectRedisIfNeeded() {
  const client = getRedis();
  if (!client) return null;
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}
