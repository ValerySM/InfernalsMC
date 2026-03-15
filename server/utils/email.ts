import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { createEmailLog } from "../db/emailLogs";

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  recipientUserId?: string;
  eventId?: string;
  memberEventId?: string;
  sendType: string;
}

async function sendRaw(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    // если SMTP не настроен — оставляем старое поведение (консоль)
    if (!host || !user || !pass || !from) {
      console.log(`📧 EMAIL TO: ${to}`);
      console.log(`   SUBJECT: ${subject}`);
      console.log(`   BODY: ${body}`);
      console.log("   (Console-only mode — configure SMTP_* env vars for real delivery)");
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      html: `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${body}</pre>`,
    });

    console.log(`📧 EMAIL SENT TO: ${to}`);
    console.log(`   SUBJECT: ${subject}`);

    return true;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return false;
  }
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  let status = "sent";

  try {
    const ok = await sendRaw(params.to, params.subject, params.body);
    if (!ok) status = "failed";
  } catch (err) {
    console.error("Email send error:", err);
    status = "failed";
  }

  await createEmailLog({
    id: nanoid(16),
    eventId: params.eventId,
    memberEventId: params.memberEventId,
    recipientUserId: params.recipientUserId,
    recipientEmail: params.to,
    subject: params.subject,
    body: params.body,
    sendType: params.sendType,
    sendStatus: status,
  });
}

export async function sendBulkEmail(
  recipients: Array<{ email: string; userId?: string }>,
  params: {
    subject: string;
    body: string;
    eventId?: string;
    memberEventId?: string;
    sendType: string;
  }
): Promise<void> {
  for (const r of recipients) {
    await sendEmail({
      to: r.email,
      subject: params.subject,
      body: params.body,
      recipientUserId: r.userId,
      eventId: params.eventId,
      memberEventId: params.memberEventId,
      sendType: params.sendType,
    });
  }
}