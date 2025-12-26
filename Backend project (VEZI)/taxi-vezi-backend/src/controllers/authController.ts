// src/controllers/authController.ts
import { Request, Response } from "express";
import { signToken } from "../utils/jwt";

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "");
}

// PASSENGER
export async function requestPassengerCode(req: Request, res: Response) {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ success: false, message: "Phone required" });

  const normalized = normalizePhone(phone);
  console.log(`Passenger auth code for ${normalized}: 1234`);
  return res.json({ success: true });
}

export async function verifyPassengerCode(req: Request, res: Response) {
  const { phone, code } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: "Phone & code required" });
  }

  const normalized = normalizePhone(phone);
  if (String(code) !== "1234") {
    return res.status(400).json({ success: false, message: "Invalid code" });
  }

  const userId = `passenger-${normalized}`;
  const token = signToken({ userId, role: "passenger" });

  return res.json({
    success: true,
    token,
    passenger: { id: userId, phone: normalized },
  });
}

// DRIVER
export async function requestDriverCode(req: Request, res: Response) {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ success: false, message: "Phone required" });

  const normalized = normalizePhone(phone);
  console.log(`Driver auth code for ${normalized}: 1234`);
  return res.json({ success: true });
}

export async function verifyDriverCode(req: Request, res: Response) {
  const { phone, code } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: "Phone & code required" });
  }

  const normalized = normalizePhone(phone);
  if (String(code) !== "1234") {
    return res.status(400).json({ success: false, message: "Invalid code" });
  }

  const userId = `driver-${normalized}`;
  const token = signToken({ userId, role: "driver" });

  return res.json({
    success: true,
    token,
    driver: { id: userId, phone: normalized, name: "Řidič Taxi Vezi" },
  });
}
