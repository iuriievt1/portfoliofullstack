import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export function requireInternalKey(req: any, _res: any, next: any) {
  const expected = env.INTERNAL_API_KEY;
  if (!expected) throw new HttpError(500, "MISCONFIGURED", "INTERNAL_API_KEY is not set");

  const provided = req.header("x-internal-key");
  if (!provided || provided !== expected) {
    throw new HttpError(401, "UNAUTHORIZED", "Invalid internal key");
  }

  next();
}
