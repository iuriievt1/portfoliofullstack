import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { requireInternalKey } from "../middlewares/internalKey";
import { getWalletSummaryHandler, listWalletEntriesHandler } from "../controllers/wallet.controller";
import {
  requestPayoutHandler,
  listMyPayoutsHandler,
  cancelMyPayoutHandler,
  processPayoutHandler
} from "../controllers/walletPayout.controller";

export const walletRoutes = Router();

/**
 * ✅ internal processing (no JWT, only INTERNAL key)
 * MUST be before requireAuth
 */
walletRoutes.post("/payouts/:id/process", requireInternalKey, processPayoutHandler);

/**
 * ✅ user endpoints (JWT)
 */
walletRoutes.use(requireAuth);

// existing
walletRoutes.get("/summary", getWalletSummaryHandler);
walletRoutes.get("/entries", listWalletEntriesHandler);

// driver withdraw
walletRoutes.get("/payouts", requireRole("DRIVER"), listMyPayoutsHandler);
walletRoutes.post("/payouts/request", requireRole("DRIVER"), requestPayoutHandler);
walletRoutes.post("/payouts/:id/cancel", requireRole("DRIVER"), cancelMyPayoutHandler);
