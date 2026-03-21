import { connectRedisIfNeeded } from "@/lib/redis";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await connectRedisIfNeeded();
  if (!client) return null;
  const value = await client.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300) {
  const client = await connectRedisIfNeeded();
  if (!client) return;
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}
