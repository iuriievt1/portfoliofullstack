import crypto from "node:crypto";

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function constantTimeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}
