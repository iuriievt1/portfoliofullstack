import type { NextFunction, Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message = err?.message || "Server error";
  res.status(status).json({ error: message });
}
