import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  listTrustedContactsHandler,
  createTrustedContactHandler,
  deleteTrustedContactHandler
} from "../controllers/trustedContact.controller";
import {
  startShareHandler,
  stopShareHandler,
  getActiveShareHandler
} from "../controllers/share.controller";
import {
  sosHandler,
  publicShareViewHandler
} from "../controllers/safety.controller";

export const safetyRoutes = Router();

// ✅ Public share view (NO AUTH) — должен быть ДО requireAuth
safetyRoutes.get("/share/:token", publicShareViewHandler);

// дальше всё защищено токеном
safetyRoutes.use(requireAuth);

// Trusted Contacts
safetyRoutes.get("/contacts", listTrustedContactsHandler);
safetyRoutes.post("/contacts", createTrustedContactHandler);
safetyRoutes.delete("/contacts/:id", deleteTrustedContactHandler);

// Share ride (auth)
safetyRoutes.post("/share/start", startShareHandler);
safetyRoutes.post("/share/:id/stop", stopShareHandler);
safetyRoutes.get("/share/active", getActiveShareHandler);

// SOS
safetyRoutes.post("/sos", sosHandler);

