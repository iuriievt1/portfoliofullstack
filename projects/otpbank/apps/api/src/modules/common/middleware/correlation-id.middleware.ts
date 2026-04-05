import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { REQUEST_ID_HEADER } from "../constants";

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = req.header(REQUEST_ID_HEADER) ?? randomUUID();
  (req as Request & { correlationId?: string }).correlationId = correlationId;
  res.setHeader(REQUEST_ID_HEADER, correlationId);
  next();
}
