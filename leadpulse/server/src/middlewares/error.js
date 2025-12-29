import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ error: "Not Found" });
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.flatten() });
  }

  const status = err.statusCode || 500;
  const message = status >= 500 ? "Internal Server Error" : err.message;
  if (req.log) req.log.error({ err }, "request error");
  res.status(status).json({ error: message });
}
