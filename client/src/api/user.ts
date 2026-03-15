import { fetchJson } from "./http";

// ═══════════════════════════════════════════
// User Auth
// ═══════════════════════════════════════════

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  emailConsent: boolean;
  reasonForRegistration?: string;
}) {
  return fetchJson<any>("/api/user/register", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function loginUser(email: string, password: string) {
  return fetchJson<any>("/api/user/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    withCredentials: true,
  });
}

export async function logoutUser() {
  return fetchJson<any>("/api/user/logout", {
    method: "POST",
    withCredentials: true,
  });
}

export async function getMe() {
  return fetchJson<any>("/api/user/me", {
    withCredentials: true,
  });
}

export async function updateMyProfile(data: {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  additionalInfo?: string;
  emailConsent?: boolean;
}) {
  return fetchJson<any>("/api/user/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return fetchJson<any>("/api/user/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
    withCredentials: true,
  });
}

export async function forgotPassword(email: string) {
  return fetchJson<any>("/api/user/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return fetchJson<any>("/api/user/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

// ═══════════════════════════════════════════
// Secretary API
// ═══════════════════════════════════════════

export async function getSecretaryStats() {
  return fetchJson<any>("/api/secretary/stats", { withCredentials: true });
}

export async function getSecretaryMembers() {
  return fetchJson<any>("/api/secretary/members", { withCredentials: true });
}

export async function getAllSiteUsers() {
  return fetchJson<any>("/api/secretary/all-users", { withCredentials: true });
}

// Groups
export async function getGroups() {
  return fetchJson<any>("/api/secretary/groups", { withCredentials: true });
}

export async function createGroup(data: { name: string; description?: string }) {
  return fetchJson<any>("/api/secretary/groups", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function updateGroup(id: string, data: { name?: string; description?: string }) {
  return fetchJson<any>(`/api/secretary/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function deleteGroup(id: string) {
  return fetchJson<any>(`/api/secretary/groups/${id}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

export async function getGroupMembers(groupId: string) {
  return fetchJson<any>(`/api/secretary/groups/${groupId}/members`, { withCredentials: true });
}

export async function addGroupMember(groupId: string, userId: string) {
  return fetchJson<any>(`/api/secretary/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId }),
    withCredentials: true,
  });
}

export async function removeGroupMember(groupId: string, userId: string) {
  return fetchJson<any>(`/api/secretary/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

// Member Events
export async function getMemberEvents(filters?: { eventType?: string; targetGroupId?: string }) {
  const params = new URLSearchParams();
  if (filters?.eventType) params.set("eventType", filters.eventType);
  if (filters?.targetGroupId) params.set("targetGroupId", filters.targetGroupId);
  const qs = params.toString();
  return fetchJson<any>(`/api/secretary/member-events${qs ? `?${qs}` : ""}`, { withCredentials: true });
}

export async function createMemberEvent(data: {
  title: string;
  description?: string;
  eventType: string;
  date: string;
  time?: string;
  location?: string;
  targetGroupId?: string;
}) {
  return fetchJson<any>("/api/secretary/member-events", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function updateMemberEvent(id: string, data: any) {
  return fetchJson<any>(`/api/secretary/member-events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function deleteMemberEvent(id: string) {
  return fetchJson<any>(`/api/secretary/member-events/${id}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

// Send email
export async function sendGroupEmail(data: {
  subject: string;
  body: string;
  targetGroupId?: string;
  sendToObservers?: boolean;
  memberEventId?: string;
}) {
  return fetchJson<any>("/api/secretary/send-email", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

// My events (member)
export async function getMyEvents() {
  return fetchJson<any>("/api/secretary/my-events", { withCredentials: true });
}

// ═══════════════════════════════════════════
// Admin: Registrations, Notifications, Email Logs, Site Users
// ═══════════════════════════════════════════

export async function getPendingRegistrations() {
  return fetchJson<any>("/api/admin/registrations/pending", { withCredentials: true });
}

export async function getAllRegistrations() {
  return fetchJson<any>("/api/admin/registrations", { withCredentials: true });
}

export async function getPendingCount() {
  return fetchJson<any>("/api/admin/registrations/pending-count", { withCredentials: true });
}

export async function decideRegistration(id: string, data: { decision: string; assignedRole?: string }) {
  return fetchJson<any>(`/api/admin/registrations/${id}/decide`, {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function getAdminNotifications() {
  return fetchJson<any>("/api/admin/notifications", { withCredentials: true });
}

export async function getUnreadNotifCount() {
  return fetchJson<any>("/api/admin/notifications/unread-count", { withCredentials: true });
}

export async function markNotifRead(id: string) {
  return fetchJson<any>(`/api/admin/notifications/${id}/read`, {
    method: "POST",
    withCredentials: true,
  });
}

export async function markAllNotifsRead() {
  return fetchJson<any>("/api/admin/notifications/read-all", {
    method: "POST",
    withCredentials: true,
  });
}

export async function getEmailLogs(limit = 100, offset = 0) {
  return fetchJson<any>(`/api/admin/email-logs?limit=${limit}&offset=${offset}`, { withCredentials: true });
}

export async function getSiteUsers(filters?: { status?: string; role?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.role) params.set("role", filters.role);
  const qs = params.toString();
  return fetchJson<any>(`/api/admin/site-users${qs ? `?${qs}` : ""}`, { withCredentials: true });
}

export async function getSiteUserCounts() {
  return fetchJson<any>("/api/admin/site-users/counts", { withCredentials: true });
}

export async function updateSiteUser(id: string, data: { role?: string; status?: string; name?: string }) {
  return fetchJson<any>(`/api/admin/site-users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    withCredentials: true,
  });
}

export async function resetSiteUserPassword(id: string, newPassword: string) {
  return fetchJson<any>(`/api/admin/site-users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
    withCredentials: true,
  });
}

export async function deleteSiteUser(id: string) {
  return fetchJson<any>(`/api/admin/site-users/${id}`, {
    method: "DELETE",
    withCredentials: true,
  });
}
