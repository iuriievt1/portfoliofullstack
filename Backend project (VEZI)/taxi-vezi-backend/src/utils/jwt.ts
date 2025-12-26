// src/utils/jwt.ts

import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export function signToken(payload: { userId: string; role: "passenger" | "driver" }) {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: string; role: "passenger" | "driver" } {
  return jwt.verify(token, ENV.JWT_SECRET) as any;
}
