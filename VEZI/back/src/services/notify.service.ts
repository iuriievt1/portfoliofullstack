import { logger } from "../config/logger";

export async function sendSms(phone: string, text: string) {
  logger.info({ phone, text }, "[SMS STUB]");
}

export async function sendEmail(email: string, subject: string, text: string) {
  logger.info({ email, subject, text }, "[EMAIL STUB]");
}
