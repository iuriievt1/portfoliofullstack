// src/routes/authRoutes.ts

import { Router } from "express";
import {
  requestPassengerCode,
  verifyPassengerCode,
  requestDriverCode,
  verifyDriverCode,
} from "../controllers/authController";

export const authRouter = Router();

// passenger
authRouter.post("/passenger/request-code", requestPassengerCode);
authRouter.post("/passenger/verify", verifyPassengerCode);

// driver
authRouter.post("/driver/request-code", requestDriverCode);
authRouter.post("/driver/verify", verifyDriverCode);
