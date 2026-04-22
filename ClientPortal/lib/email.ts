import nodemailer from "nodemailer";

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from
  };
}

function createTransport() {
  const config = getMailConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

export async function sendVerificationCodeEmail({
  name,
  email,
  code
}: {
  name: string;
  email: string;
  code: string;
}) {
  const transport = createTransport();

  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[DEV MAIL] Ověřovací kód pro ${email}: ${code}`);
      return;
    }

    throw new Error("SMTP není nastavené. Doplňte SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS a SMTP_FROM.");
  }

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  await transport.sendMail({
    from: getMailConfig().from,
    to: email,
    subject: "Ověřovací kód pro klientský portál",
    text: [
      `Dobrý den ${name},`,
      "",
      `váš ověřovací kód je: ${code}`,
      "",
      `Po ověření můžete pokračovat na: ${appUrl}/verify?email=${encodeURIComponent(email)}`,
      "",
      "Tento kód má omezenou platnost."
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>Dobrý den ${name},</p>
        <p>váš ověřovací kód pro klientský portál je:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:0.3em">${code}</p>
        <p>
          Po ověření můžete pokračovat zde:
          <a href="${appUrl}/verify?email=${encodeURIComponent(email)}">${appUrl}/verify</a>
        </p>
        <p>Tento kód má omezenou platnost.</p>
      </div>
    `
  });
}
