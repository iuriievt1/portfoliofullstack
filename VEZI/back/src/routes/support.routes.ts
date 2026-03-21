import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createSupportTicketHandler,
  listMySupportTicketsHandler,
  getMySupportTicketHandler
} from "../controllers/support.controller";

export const supportRoutes = Router();

// user only
supportRoutes.use(requireAuth);

supportRoutes.post("/tickets", createSupportTicketHandler);
supportRoutes.get("/tickets", listMySupportTicketsHandler);
supportRoutes.get("/tickets/:id", getMySupportTicketHandler);
