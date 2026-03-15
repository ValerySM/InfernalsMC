import { fetchJson, postForm } from "@/api/http";
import type { ClubEvent, EventCategory, EventMedia } from "@/data/events";
import type { GalleryMedia } from "@/components/site/MediaGallery";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminMediaItem = {
  id: string;
  type: "image" | "embed" | "video";
  url: string;
  alt?: string;
  title?: string;
  sortOrder?: number;
};

export type AdminEventGetResponse = {
  ok: true;
  event: ClubEvent;
  mediaAdmin: AdminMediaItem[];
};

export async function adminLogin(email: string, password: string) {
  const res = await fetchJson<{ ok: true; user: AdminUser }>(
    "/api/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
      withCredentials: true,
    }
  );
  return res.user;
}

export async function adminLogout() {
  await fetchJson<{ ok: true }>("/api/admin/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
    withCredentials: true,
  });
}

export async function adminMe() {
  const res = await fetchJson<{ ok: true; user: AdminUser }>("/api/admin/auth/me", {
    method: "GET",
    withCredentials: true,
  });
  return res.user;
}

export async function adminListUsers() {
  const res = await fetchJson<{ ok: true; users: AdminUser[] }>("/api/admin/users", {
    method: "GET",
    withCredentials: true,
  });
  return res.users;
}

export async function adminCreateUser(data: {
  email: string;
  name: string;
  password: string;
  role?: "admin" | "superadmin";
  isActive?: boolean;
}) {
  const res = await fetchJson<{ ok: true; user: AdminUser }>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
  return res.user;
}

export async function adminUpdateUser(id: string, patch: {
  name?: string;
  role?: "admin" | "superadmin";
  password?: string;
  isActive?: boolean;
}) {
  const res = await fetchJson<{ ok: true; user: AdminUser }>(`/api/admin/users/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
      withCredentials: true,
    }
  );
  return res.user;
}

export async function adminDeleteUser(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/users/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      withCredentials: true,
    }
  );
}

export async function adminListEvents(category?: EventCategory) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetchJson<{ ok: true; events: ClubEvent[] }>(`/api/admin/events${qs}`, {
    method: "GET",
    withCredentials: true,
  });
  return res.events;
}

export async function adminGetEvent(id: string) {
  const res = await fetchJson<AdminEventGetResponse>(`/api/admin/events/${encodeURIComponent(id)}`,
    { method: "GET", withCredentials: true }
  );
  return res;
}

export async function adminCreateEvent(event: Omit<ClubEvent, "id">) {
  const res = await fetchJson<{ ok: true; event: ClubEvent }>("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(event),
    withCredentials: true,
  });
  return res.event;
}

export async function adminUpdateEvent(id: string, patch: Partial<ClubEvent>) {
  const res = await fetchJson<{ ok: true; event: ClubEvent }>(`/api/admin/events/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(patch),
      withCredentials: true,
    }
  );
  return res.event;
}

export async function adminDeleteEvent(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/events/${encodeURIComponent(id)}`,
    { method: "DELETE", withCredentials: true }
  );
}

export async function adminUploadEventCover(eventId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; cover: string }>(
    `/api/admin/events/${encodeURIComponent(eventId)}/cover/upload`,
    form,
    { withCredentials: true }
  );
  return res.cover;
}

export async function adminUploadEventMedia(eventId: string, file: File, meta?: { alt?: string; title?: string }) {
  const form = new FormData();
  form.append("file", file);
  if (meta?.alt) form.append("alt", meta.alt);
  if (meta?.title) form.append("title", meta.title);
  const res = await postForm<{ ok: true; media: any }>(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/upload`,
    form,
    { withCredentials: true }
  );
  return res.media;
}

export async function adminAddEventMediaLink(eventId: string, item: { type: EventMedia["type"]; url: string; alt?: string; title?: string }) {
  const res = await fetchJson<{ ok: true; media: any }>(
    `/api/admin/events/${encodeURIComponent(eventId)}/media/link`,
    {
      method: "POST",
      body: JSON.stringify(item),
      withCredentials: true,
    }
  );
  return res.media;
}

export async function adminDeleteMedia(mediaId: string) {
  await fetchJson<{ ok: true }>(`/api/admin/media/${encodeURIComponent(mediaId)}`,
    { method: "DELETE", withCredentials: true }
  );
}

export async function adminReorderEventMedia(eventId: string, orderedIds: string[]) {
  await fetchJson<{ ok: true }>(`/api/admin/events/${encodeURIComponent(eventId)}/media/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
    withCredentials: true,
  });
}

export type GalleryItem = (GalleryMedia & { id: string; caption?: string });

export async function adminListGallery() {
  const res = await fetchJson<{ ok: true; items: GalleryItem[] }>("/api/admin/gallery", {
    method: "GET",
    withCredentials: true,
  });
  return res.items;
}

export async function adminUploadGallery(file: File, meta?: { caption?: string; alt?: string }) {
  const form = new FormData();
  form.append("file", file);
  if (meta?.caption) form.append("caption", meta.caption);
  if (meta?.alt) form.append("alt", meta.alt);
  const res = await postForm<{ ok: true; item: GalleryItem }>(
    `/api/admin/gallery/upload`,
    form,
    { withCredentials: true }
  );
  return res.item;
}

export async function adminAddGalleryLink(item: { type: "embed" | "video" | "image"; url: string; title?: string; caption?: string; alt?: string }) {
  const res = await fetchJson<{ ok: true; item: GalleryItem }>("/api/admin/gallery/link", {
    method: "POST",
    body: JSON.stringify(item),
    withCredentials: true,
  });
  return res.item;
}

export async function adminUpdateGallery(id: string, patch: { caption?: string | null }) {
  const res = await fetchJson<{ ok: true; item: GalleryItem }>(`/api/admin/gallery/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
      withCredentials: true,
    }
  );
  return res.item;
}

export async function adminDeleteGallery(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/gallery/${encodeURIComponent(id)}`,
    { method: "DELETE", withCredentials: true }
  );
}

// ═══════════════════════════════════════════════════════════════
// Site Content
// ═══════════════════════════════════════════════════════════════

export async function adminGetSiteContent() {
  const res = await fetchJson<{ ok: true; content: Record<string, string> }>("/api/admin/site-content", {
    method: "GET",
    withCredentials: true,
  });
  return res.content;
}

export async function adminUpdateSiteContent(entries: Record<string, string>) {
  const res = await fetchJson<{ ok: true; content: Record<string, string> }>("/api/admin/site-content", {
    method: "PUT",
    body: JSON.stringify({ entries }),
    withCredentials: true,
  });
  return res.content;
}

export async function adminUploadSiteImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; url: string }>(
    `/api/admin/site-content/upload`,
    form,
    { withCredentials: true }
  );
  return res.url;
}

// ═══════════════════════════════════════════════════════════════
// Club Members
// ═══════════════════════════════════════════════════════════════

export type ClubMemberAdmin = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  sortOrder: number;
};

export async function adminListMembers() {
  const res = await fetchJson<{ ok: true; members: ClubMemberAdmin[] }>("/api/admin/members", {
    method: "GET",
    withCredentials: true,
  });
  return res.members;
}

export async function adminCreateMember(data: { name: string; role: string; sortOrder?: number }) {
  const res = await fetchJson<{ ok: true; member: ClubMemberAdmin }>("/api/admin/members", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
  return res.member;
}

export async function adminUpdateMember(id: string, patch: Partial<{ name: string; role: string; photoUrl: string | null; sortOrder: number }>) {
  const res = await fetchJson<{ ok: true; member: ClubMemberAdmin }>(`/api/admin/members/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    withCredentials: true,
  });
  return res.member;
}

export async function adminUploadMemberPhoto(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; member: ClubMemberAdmin; url: string }>(
    `/api/admin/members/${encodeURIComponent(id)}/photo`,
    form,
    { withCredentials: true }
  );
  return res;
}

export async function adminDeleteMember(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/members/${encodeURIComponent(id)}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

export async function adminReorderMembers(ids: string[]) {
  const res = await fetchJson<{ ok: true; members: ClubMemberAdmin[] }>("/api/admin/members/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
    withCredentials: true,
  });
  return res.members;
}

// ═══════════════════════════════════════════════════════════════
// Art Projects
// ═══════════════════════════════════════════════════════════════

export type ArtProjectAdmin = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  cover?: string;
  sortOrder: number;
};

export async function adminListArtProjects() {
  const res = await fetchJson<{ ok: true; projects: ArtProjectAdmin[] }>("/api/admin/art-projects", {
    method: "GET",
    withCredentials: true,
  });
  return res.projects;
}

export async function adminGetArtProject(id: string) {
  const res = await fetchJson<{ ok: true; project: ArtProjectAdmin; mediaAdmin: AdminMediaItem[] }>(`/api/admin/art-projects/${encodeURIComponent(id)}`, {
    method: "GET",
    withCredentials: true,
  });
  return res;
}

export async function adminCreateArtProject(data: {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  sortOrder?: number;
}) {
  const res = await fetchJson<{ ok: true; project: ArtProjectAdmin }>("/api/admin/art-projects", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
  return res.project;
}

export async function adminUpdateArtProject(id: string, patch: Partial<ArtProjectAdmin>) {
  const res = await fetchJson<{ ok: true; project: ArtProjectAdmin }>(`/api/admin/art-projects/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    withCredentials: true,
  });
  return res.project;
}

export async function adminDeleteArtProject(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/art-projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

export async function adminUploadArtProjectCover(projectId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; url: string }>(
    `/api/admin/art-projects/${encodeURIComponent(projectId)}/cover`,
    form,
    { withCredentials: true }
  );
  return res.url;
}

export async function adminUploadArtProjectMedia(projectId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; media: any }>(
    `/api/admin/art-projects/${encodeURIComponent(projectId)}/media/upload`,
    form,
    { withCredentials: true }
  );
  return res.media;
}

export async function adminAddArtProjectMediaLink(projectId: string, item: { type: "image" | "embed" | "video"; url: string; alt?: string; title?: string }) {
  const res = await fetchJson<{ ok: true; media: any }>(
    `/api/admin/art-projects/${encodeURIComponent(projectId)}/media/link`,
    {
      method: "POST",
      body: JSON.stringify(item),
      withCredentials: true,
    }
  );
  return res.media;
}

export async function adminDeleteArtProjectMedia(mediaId: string) {
  await fetchJson<{ ok: true }>(`/api/admin/art-projects/media/${encodeURIComponent(mediaId)}`, {
    method: "DELETE",
    withCredentials: true,
  });
}

export async function adminReorderArtProjectMedia(projectId: string, orderedIds: string[]) {
  await fetchJson<{ ok: true }>(`/api/admin/art-projects/${encodeURIComponent(projectId)}/media/reorder`, {
    method: "PUT",
    body: JSON.stringify({ ids: orderedIds }),
    withCredentials: true,
  });
}

// ═══════════════════════════════════════════════════════════════
// Support Methods
// ═══════════════════════════════════════════════════════════════

export type SupportMethodAdmin = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  qrImage?: string;
  sortOrder: number;
};

export async function adminListSupportMethods() {
  const res = await fetchJson<{ ok: true; methods: SupportMethodAdmin[] }>("/api/admin/support-methods", {
    method: "GET",
    withCredentials: true,
  });
  return res.methods;
}

export async function adminCreateSupportMethod(data: { title: string; description?: string; link?: string; sortOrder?: number }) {
  const res = await fetchJson<{ ok: true; method: SupportMethodAdmin }>("/api/admin/support-methods", {
    method: "POST",
    body: JSON.stringify(data),
    withCredentials: true,
  });
  return res.method;
}

export async function adminUpdateSupportMethod(id: string, patch: Partial<{ title: string; description: string; link: string; qrImage: string; sortOrder: number }>) {
  const res = await fetchJson<{ ok: true; method: SupportMethodAdmin }>(`/api/admin/support-methods/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    withCredentials: true,
  });
  return res.method;
}

export async function adminUploadSupportQr(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await postForm<{ ok: true; method: SupportMethodAdmin; url: string }>(
    `/api/admin/support-methods/${encodeURIComponent(id)}/qr`,
    form,
    { withCredentials: true }
  );
  return res;
}

export async function adminDeleteSupportMethod(id: string) {
  await fetchJson<{ ok: true }>(`/api/admin/support-methods/${encodeURIComponent(id)}`, {
    method: "DELETE",
    withCredentials: true,
  });
}
