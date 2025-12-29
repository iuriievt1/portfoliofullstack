import nodemailer from "nodemailer";
import { config } from "../config.js";

let transporter = null;

function buildTransporter() {
  if (config.smtp.host && config.smtp.port && config.smtp.user && config.smtp.pass) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass }
    });
  }

  // Dev / offline-friendly: just stream the message to console.
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true
  });
}

export function getMailer() {
  if (!transporter) transporter = buildTransporter();
  return transporter;
}

export async function sendLeadNotification({ to, orgName, lead }) {
  const mailer = getMailer();

  const subject = `New lead for ${orgName}: ${lead.name}`;
  const text = [
    `New lead captured in LeadPulse`,
    `Org: ${orgName}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email || "-"}`,
    `Message: ${lead.message || "-"}`,
    `Stage: ${lead.stage}`,
    `Created: ${lead.createdAt}`
  ].join("\n");

  const info = await mailer.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text
  });

  if (info.message) {
    // streamTransport returns the raw email in info.message
    // eslint-disable-next-line no-console
    console.log("\n--- Email (dev transport) ---\n" + info.message.toString() + "\n--- end ---\n");
  }
}
