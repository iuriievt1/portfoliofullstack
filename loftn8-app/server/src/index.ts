import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { guestRouter } from "./modules/guest/guest.routes";
import { menuRouter } from "./modules/menu/menu.routes";
import { ordersRouter } from "./modules/orders/orders.routes";
import { callsRouter } from "./modules/calls/calls.routes";
import { paymentsRouter } from "./modules/payments/payments.routes";
import { ratingsRouter } from "./modules/ratings/ratings.routes";

import { staffRouter } from "./modules/staff/staff.router";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/guest", guestRouter);

app.use("/menu", menuRouter);
app.use("/orders", ordersRouter);
app.use("/calls", callsRouter);
app.use("/payments", paymentsRouter);
app.use("/ratings", ratingsRouter);

// ✅ one mount for staff
app.use("/staff", staffRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`✅ API running on http://localhost:${env.PORT}`);
});
