import { Router } from "express";
import { requestOtpHandler, verifyOtpHandler, refreshHandler, logoutHandler } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post("/request-otp", requestOtpHandler);
authRoutes.post("/verify-otp", verifyOtpHandler);
authRoutes.post("/refresh", refreshHandler);
authRoutes.post("/logout", logoutHandler);
