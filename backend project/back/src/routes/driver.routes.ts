import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  setAvailabilityHandler,
  listOffersHandler,
  acceptOfferHandler,
  declineOfferHandler,
  updateRideStatusHandler,
  postLocationHandler,
  driverCancelRideHandler,
  noShowHandler
} from "../controllers/driver.controller";
import {
  listPassPlansHandler,
  getActivePassHandler,
  purchasePassHandler
} from "../controllers/driverPass.controller";

export const driverRoutes = Router();

driverRoutes.use(requireAuth, requireRole("DRIVER"));

driverRoutes.post("/availability", setAvailabilityHandler);
driverRoutes.post("/status", setAvailabilityHandler);

driverRoutes.get("/offers", listOffersHandler);
driverRoutes.post("/offers/accept", acceptOfferHandler);
driverRoutes.post("/offers/decline", declineOfferHandler);

driverRoutes.post("/rides/status", updateRideStatusHandler);

driverRoutes.post("/rides/location", postLocationHandler);
driverRoutes.post("/location", postLocationHandler);

driverRoutes.post("/rides/cancel", driverCancelRideHandler);
driverRoutes.post("/rides/no-show", noShowHandler);

// ✅ Passes
driverRoutes.get("/passes/plans", listPassPlansHandler);
driverRoutes.get("/passes/active", getActivePassHandler);
driverRoutes.post("/passes/purchase", purchasePassHandler);
