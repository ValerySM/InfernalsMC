import * as React from "react";
import type { ClubEvent, EventCategory } from "@/data/events";
import type { GalleryMedia } from "@/components/site/MediaGallery";
import {
  fetchPublicEventBySlug,
  fetchPublicEvents,
  fetchPublicGallery,
  fetchSiteContent,
  fetchMembers,
  fetchArtProjects,
  fetchArtProjectBySlug,
  fetchSupportMethods,
  type SiteContent,
  type ClubMember,
  type ArtProject,
  type SupportMethod,
} from "@/api/public";

export function usePublicEvents(category?: EventCategory) {
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchPublicEvents(category)
      .then(list => {
        if (!mounted) return;
        setEvents(list);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category]);

  return { events, loading, error };
}

export function usePublicEvent(slug: string) {
  const [event, setEvent] = React.useState<ClubEvent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchPublicEventBySlug(slug)
      .then(e => {
        if (!mounted) return;
        setEvent(e);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setEvent(null);
        setError(e?.message || "Failed to load");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { event, loading, error };
}

export function usePublicGallery() {
  const [items, setItems] = React.useState<(GalleryMedia & { id: string; caption?: string })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchPublicGallery()
      .then(list => {
        if (!mounted) return;
        setItems(list);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading, error };
}

// ── Site Content ──
export function useSiteContent() {
  const [content, setContent] = React.useState<SiteContent>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchSiteContent()
      .then(c => {
        if (!mounted) return;
        setContent(c);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load site content");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  /** Helper: get a content value with fallback */
  const get = React.useCallback(
    (key: string, fallback: string = "") => content[key] ?? fallback,
    [content]
  );

  return { content, get, loading, error };
}

// ── Club Members ──
export function useMembers() {
  const [members, setMembers] = React.useState<ClubMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchMembers()
      .then(list => {
        if (!mounted) return;
        setMembers(list);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load members");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { members, loading, error };
}

// ── Art Projects ──
export function useArtProjects() {
  const [projects, setProjects] = React.useState<ArtProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchArtProjects()
      .then(list => {
        if (!mounted) return;
        setProjects(list);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load art projects");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { projects, loading, error };
}

export function useArtProject(slug: string) {
  const [project, setProject] = React.useState<ArtProject | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchArtProjectBySlug(slug)
      .then(p => {
        if (!mounted) return;
        setProject(p);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setProject(null);
        setError(e?.message || "Failed to load project");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  return { project, loading, error };
}

// ── Support Methods ──
export function useSupportMethods() {
  const [methods, setMethods] = React.useState<SupportMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchSupportMethods()
      .then(list => {
        if (!mounted) return;
        setMethods(list);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load support methods");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { methods, loading, error };
}
