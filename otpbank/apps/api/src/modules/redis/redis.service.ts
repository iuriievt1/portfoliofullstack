import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { EnvService } from "../config/env.service";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(env: EnvService) {
    this.client = new Redis(env.redisUrl ?? process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true
    });
  }

  async increment(key: string, ttlSeconds: number) {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, ttlSeconds);
    const result = await multi.exec();
    return Number(result?.[0]?.[1] ?? 0);
  }

  async get(key: string) { return this.client.get(key); }
  async set(key: string, value: string, ttlSeconds: number) { await this.client.set(key, value, "EX", ttlSeconds); }
  get raw() { return this.client; }

  async onModuleDestroy() { await this.client.quit(); }
}
