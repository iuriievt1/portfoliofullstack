import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  createPaymentIntentHandler,
  getMyRidePaymentHandler,
  confirmPaymentMockHandler
} from "../controllers/payment.controller";

export const paymentRoutes = Router();

paymentRoutes.use(requireAuth);

// Passenger payment flow (mock for now)
paymentRoutes.post("/intent", createPaymentIntentHandler);
paymentRoutes.get("/ride/:rideId", getMyRidePaymentHandler);
paymentRoutes.post("/confirm", confirmPaymentMockHandler);
