import { getPool } from "./pool";

export type RegRequestRow = {
  id: string;
  user_id: string;
  reason_for_registration: string | null;
  admin_decision: string | null;
  assigned_role: string | null;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
};

export type RegRequestPublic = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  reasonForRegistration: string | null;
  adminDecision: string | null;
  assignedRole: string | null;
  decidedBy: string | null;
  decidedByName?: string | null;
  decidedAt: string | null;
  createdAt: string;
};

function toPublic(r: any): RegRequestPublic {
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || undefined,
    userEmail: r.user_email || undefined,
    reasonForRegistration: r.reason_for_registration,
    adminDecision: r.admin_decision,
    assignedRole: r.assigned_role,
    decidedBy: r.decided_by,
    decidedByName: r.admin_name || undefined,
    decidedAt: r.decided_at,
    createdAt: r.created_at,
  };
}

export async function createRegRequest(params: {
  id: string;
  userId: string;
  reasonForRegistration?: string;
}): Promise<RegRequestPublic> {
  const pool = getPool();
  const res = await pool.query<RegRequestRow>(
    `INSERT INTO registration_requests (id, user_id, reason_for_registration)
     VALUES ($1, $2, $3) RETURNING *`,
    [params.id, params.userId, params.reasonForRegistration || null]
  );
  return toPublic(res.rows[0]);
}

export async function listPendingRequests(): Promise<RegRequestPublic[]> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT rr.*, u.name as user_name, u.email as user_email
     FROM registration_requests rr
     JOIN users u ON u.id = rr.user_id
     WHERE rr.admin_decision IS NULL
     ORDER BY rr.created_at ASC`
  );
  return res.rows.map(toPublic);
}

export async function listAllRequests(limit = 100): Promise<RegRequestPublic[]> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT rr.*, u.name as user_name, u.email as user_email, au.name as admin_name
     FROM registration_requests rr
     JOIN users u ON u.id = rr.user_id
     LEFT JOIN admin_users au ON au.id = rr.decided_by
     ORDER BY rr.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows.map(toPublic);
}

export async function decideRequest(id: string, params: {
  decision: "approved" | "rejected";
  assignedRole?: string;
  decidedBy: string;
}): Promise<RegRequestPublic | null> {
  const pool = getPool();
  const res = await pool.query<RegRequestRow>(
    `UPDATE registration_requests
     SET admin_decision = $1, assigned_role = $2, decided_by = $3, decided_at = now()
     WHERE id = $4
     RETURNING *`,
    [params.decision, params.assignedRole || null, params.decidedBy, id]
  );
  return res.rows[0] ? toPublic(res.rows[0]) : null;
}

export async function countPendingRequests(): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM registration_requests WHERE admin_decision IS NULL"
  );
  return Number(res.rows[0]?.count || 0);
}
