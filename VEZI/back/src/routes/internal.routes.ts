import { Router } from "express";
import { requireInternalKey } from "../middlewares/internalKey";
import {
  listDriverDocumentsInternalHandler,
  decideDriverDocumentInternalHandler
} from "../controllers/internalDriverVerification.controller";
import {
  internalListTicketsHandler,
  internalUpdateTicketStatusHandler
} from "../controllers/support.controller";

export const internalRoutes = Router();

internalRoutes.use(requireInternalKey);

//docs moderation
internalRoutes.get("/driver-documents", listDriverDocumentsInternalHandler);
internalRoutes.post("/driver-documents/:id/decision", decideDriverDocumentInternalHandler);

//support moderation
internalRoutes.get("/support/tickets", internalListTicketsHandler);
internalRoutes.post("/support/tickets/:id/status", internalUpdateTicketStatusHandler);
