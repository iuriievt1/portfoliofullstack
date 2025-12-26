// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "passenger" | "driver";
      };
    }
  }
}

export {};
