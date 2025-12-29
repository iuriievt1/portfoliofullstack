import { logger } from "../config/logger";

/**
 * В релизе сюда подключаем Twilio/локального SMS провайдера и SendGrid/Mailgun.
 * Сейчас — заглушка, но backend полностью готов.
 */
export async function sendSms(phone: string, text: string) {
  logger.info({ phone, text }, "[SMS STUB]");
}

export async function sendEmail(email: string, subject: string, text: string) {
  logger.info({ email, subject, text }, "[EMAIL STUB]");
}
