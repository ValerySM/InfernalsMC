import { getPool } from "./pool";

export type AdminNotifRow = {
  id: string;
  admin_user_id: string | null;
  notification_type: string;
  title: string;
  message: string | null;
  related_user_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type AdminNotifPublic = {
  id: string;
  adminUserId: string | null;
  notificationType: string;
  title: string;
  message: string | null;
  relatedUserId: string | null;
  isRead: boolean;
  createdAt: string;
};

function toPublic(r: AdminNotifRow): AdminNotifPublic {
  return {
    id: r.id,
    adminUserId: r.admin_user_id,
    notificationType: r.notification_type,
    title: r.title,
    message: r.message,
    relatedUserId: r.related_user_id,
    isRead: r.is_read,
    createdAt: r.created_at,
  };
}

export async function createAdminNotification(params: {
  id: string;
  adminUserId?: string;
  notificationType: string;
  title: string;
  message?: string;
  relatedUserId?: string;
}): Promise<AdminNotifPublic> {
  const pool = getPool();
  const res = await pool.query<AdminNotifRow>(
    `INSERT INTO admin_notifications (id, admin_user_id, notification_type, title, message, related_user_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [params.id, params.adminUserId || null, params.notificationType, params.title,
     params.message || null, params.relatedUserId || null]
  );
  return toPublic(res.rows[0]);
}

// Notify ALL admins about something
export async function notifyAllAdmins(params: {
  notificationType: string;
  title: string;
  message?: string;
  relatedUserId?: string;
  generateId: () => string;
}): Promise<void> {
  const pool = getPool();
  const admins = await pool.query<{ id: string }>(
    "SELECT id FROM admin_users WHERE is_active = true"
  );
  for (const admin of admins.rows) {
    await pool.query(
      `INSERT INTO admin_notifications (id, admin_user_id, notification_type, title, message, related_user_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [params.generateId(), admin.id, params.notificationType, params.title,
       params.message || null, params.relatedUserId || null]
    );
  }
}

export async function listAdminNotifications(adminUserId: string, limit = 50): Promise<AdminNotifPublic[]> {
  const pool = getPool();
  const res = await pool.query<AdminNotifRow>(
    `SELECT * FROM admin_notifications
     WHERE admin_user_id = $1 OR admin_user_id IS NULL
     ORDER BY created_at DESC
     LIMIT $2`,
    [adminUserId, limit]
  );
  return res.rows.map(toPublic);
}

export async function countUnreadNotifications(adminUserId: string): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM admin_notifications
     WHERE (admin_user_id = $1 OR admin_user_id IS NULL) AND is_read = false`,
    [adminUserId]
  );
  return Number(res.rows[0]?.count || 0);
}

export async function markNotificationRead(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("UPDATE admin_notifications SET is_read = true WHERE id = $1", [id]);
}

export async function markAllNotificationsRead(adminUserId: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    "UPDATE admin_notifications SET is_read = true WHERE (admin_user_id = $1 OR admin_user_id IS NULL) AND is_read = false",
    [adminUserId]
  );
}
