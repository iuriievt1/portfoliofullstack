import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";
import { logger } from "../config/logger";

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const code = err?.code ?? "INTERNAL_ERROR";
  const message = err?.message ?? "Internal error";

  if (status >= 500) {
    logger.error({ err, path: req.path }, "Unhandled error");
  }

  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      details: err?.details
    }
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Route not found" } });
}
