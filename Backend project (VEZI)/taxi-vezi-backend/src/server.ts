import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import { authRouter } from "./routes/authRoutes";
import ridesRoutes from "./routes/rides.routes";
import driverRoutes from "./routes/driver.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "taxi-vezi-backend" });
});

app.use("/auth", authRouter);
app.use("/rides", ridesRoutes);
app.use("/driver", driverRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Taxi Vezi backend running on http://localhost:${ENV.PORT}`);
});
