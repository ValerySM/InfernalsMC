import { fetchJson } from "@/api/http";
import type { ClubEvent, EventCategory } from "@/data/events";
import type { GalleryMedia } from "@/components/site/MediaGallery";

export type PublicEventsResponse = { ok: true; events: ClubEvent[] };
export type PublicEventResponse = { ok: true; event: ClubEvent };
export type PublicGalleryResponse = { ok: true; items: (GalleryMedia & { id: string; caption?: string })[] };

export async function fetchPublicEvents(category?: EventCategory) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetchJson<PublicEventsResponse>(`/api/public/events${qs}`);
  return res.events;
}

export async function fetchPublicEventBySlug(slug: string) {
  const res = await fetchJson<PublicEventResponse>(`/api/public/events/${encodeURIComponent(slug)}`);
  return res.event;
}

export async function fetchPublicGallery() {
  const res = await fetchJson<PublicGalleryResponse>(`/api/public/gallery`);
  return res.items;
}

// ── Site Content ──
export type SiteContent = Record<string, string>;

export async function fetchSiteContent(): Promise<SiteContent> {
  const res = await fetchJson<{ ok: true; content: SiteContent }>(`/api/public/site-content`);
  return res.content;
}

export async function fetchSiteContentByKeys(keys: string[]): Promise<SiteContent> {
  const qs = `?keys=${keys.map(encodeURIComponent).join(",")}`;
  const res = await fetchJson<{ ok: true; content: SiteContent }>(`/api/public/site-content${qs}`);
  return res.content;
}

// ── Club Members ──
export type ClubMember = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  sortOrder: number;
};

export async function fetchMembers(): Promise<ClubMember[]> {
  const res = await fetchJson<{ ok: true; members: ClubMember[] }>(`/api/public/members`);
  return res.members;
}

// ── Art Projects ──
export type ArtProject = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  cover?: string;
  media?: GalleryMedia[];
  sortOrder: number;
};

export async function fetchArtProjects(): Promise<ArtProject[]> {
  const res = await fetchJson<{ ok: true; projects: ArtProject[] }>(`/api/public/art-projects`);
  return res.projects;
}

export async function fetchArtProjectBySlug(slug: string): Promise<ArtProject | null> {
  try {
    const res = await fetchJson<{ ok: true; project: ArtProject }>(`/api/public/art-projects/${encodeURIComponent(slug)}`);
    return res.project;
  } catch {
    return null;
  }
}

// ── Support Methods ──
export type SupportMethod = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  qrImage?: string;
  sortOrder: number;
};

export async function fetchSupportMethods(): Promise<SupportMethod[]> {
  const res = await fetchJson<{ ok: true; methods: SupportMethod[] }>(`/api/public/support-methods`);
  return res.methods;
}
