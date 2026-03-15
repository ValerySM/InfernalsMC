import { getPool } from "./pool";

export type EmailLogRow = {
  id: string;
  event_id: string | null;
  member_event_id: string | null;
  recipient_user_id: string | null;
  recipient_email: string;
  subject: string;
  body: string | null;
  send_type: string;
  send_status: string;
  sent_at: string;
};

export type EmailLogPublic = {
  id: string;
  eventId: string | null;
  memberEventId: string | null;
  recipientUserId: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  body: string | null;
  sendType: string;
  sendStatus: string;
  sentAt: string;
};

function toPublic(r: any): EmailLogPublic {
  return {
    id: r.id,
    eventId: r.event_id,
    memberEventId: r.member_event_id,
    recipientUserId: r.recipient_user_id,
    recipientEmail: r.recipient_email,
    recipientName: r.recipient_name || null,
    subject: r.subject,
    body: r.body,
    sendType: r.send_type,
    sendStatus: r.send_status,
    sentAt: r.sent_at,
  };
}

export async function createEmailLog(params: {
  id: string;
  eventId?: string;
  memberEventId?: string;
  recipientUserId?: string;
  recipientEmail: string;
  subject: string;
  body?: string;
  sendType: string;
  sendStatus: string;
}): Promise<EmailLogPublic> {
  const pool = getPool();
  const res = await pool.query<EmailLogRow>(
    `INSERT INTO email_logs (id, event_id, member_event_id, recipient_user_id, recipient_email, subject, body, send_type, send_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [params.id, params.eventId || null, params.memberEventId || null, params.recipientUserId || null,
     params.recipientEmail, params.subject, params.body || null, params.sendType, params.sendStatus]
  );
  return toPublic(res.rows[0]);
}

export async function listEmailLogs(limit = 100, offset = 0): Promise<EmailLogPublic[]> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT el.*, u.name as recipient_name
     FROM email_logs el
     LEFT JOIN users u ON u.id = el.recipient_user_id
     ORDER BY el.sent_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return res.rows.map(toPublic);
}

export async function countEmailLogs(): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ count: string }>("SELECT COUNT(*)::text as count FROM email_logs");
  return Number(res.rows[0]?.count || 0);
}
