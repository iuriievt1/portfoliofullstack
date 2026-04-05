import { createHash, randomBytes } from "crypto";

export function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function randomToken(size = 32) {
  return randomBytes(size).toString("hex");
}

export function numericCode(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
