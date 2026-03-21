import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.json({ ok: true, service: "vezi-back", ts: new Date().toISOString() });
});
