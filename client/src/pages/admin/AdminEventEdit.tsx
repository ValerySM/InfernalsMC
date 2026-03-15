import * as React from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Upload, Plus, Trash2, ArrowUp, ArrowDown, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { adminAddEventMediaLink, adminCreateEvent, adminDeleteMedia, adminGetEvent, adminReorderEventMedia, adminUpdateEvent, adminUploadEventCover, adminUploadEventMedia } from "@/api/admin";
import type { ClubEvent, EventCategory, EventMedia } from "@/data/events";
import { getEventHref } from "@/data/events";

type FormState = {
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  tags: string;
  externalUrl: string;
  cover?: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tagsToString(tags: string[]) {
  return tags.join(", ");
}

function tagsFromString(s: string): string[] {
  return s
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

function emptyForm(category: EventCategory = "event"): FormState {
  return {
    title: "",
    slug: "",
    date: "",
    time: "",
    location: "",
    shortDescription: "",
    description: "",
    category,
    tags: "",
    externalUrl: "",
  };
}

function MediaPreview({ item }: { item: { type: string; url: string; title?: string; alt?: string } }) {
  if (item.type === "image") {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className="block border-2 border-gray-700 bg-black/30 overflow-hidden">
        <img src={item.url} alt={item.alt || ""} className="w-full h-48 object-cover" loading="lazy" />
      </a>
    );
  }
  if (item.type === "video") {
    return (
      <div className="border-2 border-gray-700 bg-black/30">
        <video controls className="w-full h-48 object-cover" src={item.url} />
      </div>
    );
  }
  return (
    <div className="border-2 border-gray-700 bg-black/30">
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={item.url}
          title={item.title || "Embedded"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default function AdminEventEdit({ id }: { id: string }) {
  const isNew = id === "new";
  const [, setLocation] = useLocation();

  const [form, setForm] = React.useState<FormState>(emptyForm("event"));
  const [eventId, setEventId] = React.useState<string | null>(isNew ? null : id);
  const [mediaAdmin, setMediaAdmin] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminGetEvent(id);
      const e = res.event;
      setEventId(e.id);
      setForm({
        title: e.title,
        slug: e.slug,
        date: e.date,
        time: e.time || "",
        location: e.location || "",
        shortDescription: e.shortDescription,
        description: e.description,
        category: e.category,
        tags: tagsToString(e.tags || []),
        externalUrl: e.externalUrl || "",
        cover: e.cover,
      });
      setMediaAdmin(res.mediaAdmin || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  React.useEffect(() => {
    load();
  }, [load]);

  const setField = (k: keyof FormState, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.date.trim()) return "Date is required";
    if (!form.shortDescription.trim()) return "Short description is required";
    if (!form.description.trim()) return "Description is required";
    return null;
  };

  const onSave = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        date: form.date.trim(),
        time: form.time.trim() || undefined,
        location: form.location.trim() || undefined,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: tagsFromString(form.tags),
        externalUrl: form.externalUrl.trim() || undefined,
      } satisfies Omit<ClubEvent, "id">;

      let saved: ClubEvent;
      if (isNew) {
        saved = await adminCreateEvent(payload);
        toast.success("Event created");
        setLocation(`/admin/events/${encodeURIComponent(saved.id)}`);
      } else {
        saved = await adminUpdateEvent(id, payload);
        toast.success("Event saved");
        // keep cover from upload endpoint
        setForm(prev => ({ ...prev, cover: saved.cover }));
      }
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onUploadCover = async (file: File) => {
    if (!eventId) {
      toast.error("Save the event first (create it), then upload a cover.");
      return;
    }
    try {
      const cover = await adminUploadEventCover(eventId, file);
      setField("cover", cover);
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Cover upload failed");
    }
  };

  const onUploadMedia = async (file: File) => {
    if (!eventId) {
      toast.error("Save the event first (create it), then upload media.");
      return;
    }
    try {
      await adminUploadEventMedia(eventId, file);
      toast.success("Media uploaded");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Media upload failed");
    }
  };

  const [linkType, setLinkType] = React.useState<EventMedia["type"]>("embed");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkTitle, setLinkTitle] = React.useState("");
  const [linkAlt, setLinkAlt] = React.useState("");

  const onAddLink = async () => {
    if (!eventId) {
      toast.error("Save the event first (create it), then add media.");
      return;
    }
    if (!linkUrl.trim()) {
      toast.error("URL is required");
      return;
    }
    try {
      await adminAddEventMediaLink(eventId, {
        type: linkType,
        url: linkUrl.trim(),
        title: linkTitle.trim() || undefined,
        alt: linkAlt.trim() || undefined,
      });
      setLinkUrl("");
      setLinkTitle("");
      setLinkAlt("");
      toast.success("Media added");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add media");
    }
  };

  const onDeleteMedia = async (mediaId: string) => {
    try {
      await adminDeleteMedia(mediaId);
      toast.success("Removed");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...mediaAdmin];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    const [a] = next.splice(idx, 1);
    next.splice(target, 0, a);
    setMediaAdmin(next);
    if (!eventId) return;
    try {
      await adminReorderEventMedia(eventId, next.map(x => x.id));
    } catch {
      // ignore, will reload
    }
  };

  return (
    <div>
      <PageHeader
        title={isNew ? "Create Event" : "Edit Event"}
        subtitle="Everything you edit here is saved in the database. The public pages update automatically."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            <ArrowLeft className="size-4" /> Back to Events
          </Link>
          {!isNew && eventId ? (
            <a
              href={getEventHref({ slug: form.slug, category: form.category })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
            >
              Open Public Page
            </a>
          ) : null}
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-16">
        {error ? (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-4 mb-6">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="border-2 border-gray-700 bg-black/30 p-6 text-gray-200">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form */}
            <div className="lg:col-span-2 border-2 border-gray-700 bg-black/30 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">Title *</label>
                  <Input
                    value={form.title}
                    onChange={e => setField("title", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                    placeholder="Ride to the North"
                  />
                </div>

                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Slug *</label>
                  <div className="flex gap-2">
                    <Input
                      value={form.slug}
                      onChange={e => setField("slug", e.target.value)}
                      className="bg-black/40 border-gray-700 text-gray-200"
                      placeholder="ride-to-the-north"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 text-gray-200 hover:bg-black/40"
                      onClick={() => setField("slug", slugify(form.title || form.slug))}
                      title="Generate from title"
                    >
                      <Wand2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Category *</label>
                  <Select value={form.category} onValueChange={v => setField("category", v as EventCategory)}>
                    <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="organized">Organized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Date *</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={e => setField("date", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Time</label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={e => setField("time", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">Location</label>
                  <Input
                    value={form.location}
                    onChange={e => setField("location", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                    placeholder="Rishon LeZion"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">Short Description *</label>
                  <Textarea
                    value={form.shortDescription}
                    onChange={e => setField("shortDescription", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200 min-h-[90px]"
                    placeholder="One line summary for cards and header"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">Description *</label>
                  <Textarea
                    value={form.description}
                    onChange={e => setField("description", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200 min-h-[160px]"
                    placeholder="Full description for the event page"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">Tags (comma separated)</label>
                  <Input
                    value={form.tags}
                    onChange={e => setField("tags", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                    placeholder="ride, open, scenic"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-heading uppercase text-gray-300 mb-2">External URL</label>
                  <Input
                    value={form.externalUrl}
                    onChange={e => setField("externalUrl", e.target.value)}
                    className="bg-black/40 border-gray-700 text-gray-200"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <Separator className="my-6 bg-gray-800" />
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-gray-400 text-sm">Fields marked with * are required.</p>
                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : isNew ? "Create" : "Save"}
                </Button>
              </div>
            </div>

            {/* Right column */}
            <div className="border-2 border-gray-700 bg-black/30 p-6">
              <h2 className="font-heading uppercase text-xl text-white">Cover</h2>
              <p className="text-gray-400 text-sm mt-1">Shown on event cards and at the top of the event page.</p>

              <div className="mt-4">
                {form.cover ? (
                  <img src={form.cover} alt="cover" className="w-full h-52 object-cover border-2 border-gray-700" />
                ) : (
                  <div className="w-full h-52 border-2 border-gray-700 bg-black/40 flex items-center justify-center text-gray-500">
                    No cover
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="inline-flex items-center justify-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200 cursor-pointer">
                  <Upload className="size-4" /> Upload Cover
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) onUploadCover(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              <Separator className="my-6 bg-gray-800" />

              <h2 className="font-heading uppercase text-xl text-white">Media</h2>
              <p className="text-gray-400 text-sm mt-1">Images/videos/embeds shown in “Photos & Videos”.</p>

              <div className="mt-4 space-y-3">
                <label className="inline-flex items-center justify-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200 cursor-pointer w-full">
                  <Upload className="size-4" /> Upload Image/Video
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) onUploadMedia(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                <div className="border border-gray-800 bg-black/20 p-3">
                  <p className="font-heading uppercase text-gray-300 text-sm mb-2">Add by URL</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Select value={linkType} onValueChange={v => setLinkType(v as any)}>
                      <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="embed">Embed (YouTube/Vimeo iframe src)</SelectItem>
                        <SelectItem value="video">Video URL (mp4/webm)</SelectItem>
                        <SelectItem value="image">Image URL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="bg-black/40 border-gray-700 text-gray-200" />
                    {linkType === "image" ? (
                      <Input value={linkAlt} onChange={e => setLinkAlt(e.target.value)} placeholder="Alt text (optional)" className="bg-black/40 border-gray-700 text-gray-200" />
                    ) : (
                      <Input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Title (optional)" className="bg-black/40 border-gray-700 text-gray-200" />
                    )}
                    <Button type="button" onClick={onAddLink} className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
                      <Plus className="size-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media list */}
        {!loading && !isNew && mediaAdmin.length ? (
          <div className="mt-10">
            <h2 className="font-heading uppercase text-2xl text-red-500 text-center mb-6">Photos & Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mediaAdmin.map((m, idx) => (
                <div key={m.id} className="relative">
                  <MediaPreview item={m} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-2 py-1 font-heading uppercase text-gray-200 text-xs"
                      title="Move up"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-2 py-1 font-heading uppercase text-gray-200 text-xs"
                      title="Move down"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMedia(m.id)}
                      className="inline-flex items-center gap-1 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 font-heading uppercase text-red-200 text-xs"
                      title="Delete"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
