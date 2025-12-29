import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  addTrustedContactHandler,
  listTrustedContactsHandler,
  deleteTrustedContactHandler,
  startShareTripHandler,
  stopShareTripHandler,
  sosHandler,
  listSafetyEventsHandler
} from "../controllers/safety.controller";

export const safetyRoutes = Router();

safetyRoutes.use(requireAuth);

safetyRoutes.get("/trusted-contacts", listTrustedContactsHandler);
safetyRoutes.post("/trusted-contacts", addTrustedContactHandler);
safetyRoutes.delete("/trusted-contacts/:id", deleteTrustedContactHandler);

safetyRoutes.post("/share/start", startShareTripHandler);
safetyRoutes.post("/share/stop", stopShareTripHandler);

safetyRoutes.post("/sos", sosHandler);
safetyRoutes.get("/events", listSafetyEventsHandler);
