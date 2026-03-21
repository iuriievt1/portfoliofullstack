import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  setAvailabilityHandler,
  listOffersHandler,
  acceptOfferHandler,
  declineOfferHandler,
  postLocationHandler
} from "../controllers/driver.controller";
import {
  listPassPlansHandler,
  getActivePassHandler,
  purchasePassHandler
} from "../controllers/driverPass.controller";
import {
  listMyDriverDocumentsHandler,
  createDriverDocumentHandler,
  resubmitDriverDocumentHandler
} from "../controllers/driverDocument.controller";


export const driverRoutes = Router();

driverRoutes.use(requireAuth, requireRole("DRIVER"));

driverRoutes.post("/availability", setAvailabilityHandler);

driverRoutes.get("/offers", listOffersHandler);
driverRoutes.post("/offers/accept", acceptOfferHandler);
driverRoutes.post("/offers/decline", declineOfferHandler);

// только online-location для матчинга
driverRoutes.post("/location", postLocationHandler);

// ✅ Passes
driverRoutes.get("/passes/plans", listPassPlansHandler);
driverRoutes.get("/passes/active", getActivePassHandler);
driverRoutes.post("/passes/purchase", purchasePassHandler);

// ✅ Driver documents (submit/resubmit)
driverRoutes.get("/documents", listMyDriverDocumentsHandler);
driverRoutes.post("/documents", createDriverDocumentHandler);
driverRoutes.put("/documents/:id", resubmitDriverDocumentHandler);
