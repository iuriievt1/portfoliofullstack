import { Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });

new Worker(
  "notifications",
  async (job) => {
    console.log("Processing notification job", job.id, job.data);
  },
  { connection }
);

new Worker(
  "documents",
  async (job) => {
    console.log("Processing document job", job.id, job.data);
  },
  { connection }
);

console.log("OTPBank worker started");
