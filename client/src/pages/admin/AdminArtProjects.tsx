import * as React from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  adminListArtProjects,
  adminCreateArtProject,
  adminDeleteArtProject,
  adminUpdateArtProject,
  adminUploadArtProjectCover,
  adminUploadArtProjectMedia,
  adminGetArtProject,
  adminDeleteArtProjectMedia,
  adminAddArtProjectMediaLink,
  type ArtProjectAdmin,
  type AdminMediaItem,
} from "@/api/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function ProjectEditor({
  project,
  onClose,
  onSaved,
}: {
  project: ArtProjectAdmin;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState(project.title);
  const [slug, setSlug] = React.useState(project.slug);
  const [shortDesc, setShortDesc] = React.useState(project.shortDescription);
  const [desc, setDesc] = React.useState(project.description);
  const [tags, setTags] = React.useState(project.tags.join(", "));
  const [media, setMedia] = React.useState<AdminMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = React.useState(true);

  // Link form
  const [linkType, setLinkType] = React.useState<"embed" | "video" | "image">("image");
  const [linkUrl, setLinkUrl] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await adminGetArtProject(project.id);
        setMedia(res.mediaAdmin || []);
      } catch {
        // ignore
      } finally {
        setLoadingMedia(false);
      }
    })();
  }, [project.id]);

  const onSaveDetails = async () => {
    try {
      await adminUpdateArtProject(project.id, {
        title: title.trim(),
        slug: slug.trim(),
        shortDescription: shortDesc.trim(),
        description: desc.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      toast.success("Project updated");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  const onUploadCover = async (file: File) => {
    try {
      await adminUploadArtProjectCover(project.id, file);
      toast.success("Cover uploaded");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const onUploadMedia = async (files: FileList) => {
    try {
      for (const f of Array.from(files)) {
        await adminUploadArtProjectMedia(project.id, f);
      }
      toast.success("Media uploaded");
      const res = await adminGetArtProject(project.id);
      setMedia(res.mediaAdmin || []);
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const onAddMediaLink = async () => {
    if (!linkUrl.trim()) { toast.error("URL required"); return; }
    try {
      await adminAddArtProjectMediaLink(project.id, { type: linkType, url: linkUrl.trim() });
      setLinkUrl("");
      toast.success("Added");
      const res = await adminGetArtProject(project.id);
      setMedia(res.mediaAdmin || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  const onDeleteMedia = async (mediaId: string) => {
    try {
      await adminDeleteArtProjectMedia(mediaId);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  return (
    <div className="border-2 border-gray-700 bg-black/30 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading uppercase text-xl text-red-500">Edit: {project.title}</h2>
        <Button variant="outline" className="border-gray-700 text-gray-200" onClick={onClose}>Close</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-black/40 border-gray-700 text-gray-200" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Slug</label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} className="bg-black/40 border-gray-700 text-gray-200" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Short Description</label>
        <Input value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="bg-black/40 border-gray-700 text-gray-200" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Full Description</label>
        <Textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-black/40 border-gray-700 text-gray-200 min-h-[100px]" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="paint, helmet, custom" className="bg-black/40 border-gray-700 text-gray-200" />
      </div>

      <div className="flex gap-3">
        <Button onClick={onSaveDetails} className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
          Save Details
        </Button>
        <label className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200 cursor-pointer">
          <Upload className="size-4" /> Upload Cover
          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUploadCover(f); e.currentTarget.value = ""; }} />
        </label>
      </div>

      {/* Media */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="font-heading uppercase text-lg text-white mb-4">Project Media</h3>

        {loadingMedia ? (
          <p className="text-gray-400">Loading media…</p>
        ) : media.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {media.map(m => (
              <div key={m.id} className="border border-gray-700 bg-black/20 p-2">
                {m.type === "image" ? (
                  <img src={m.url} alt={m.alt || ""} className="w-full h-28 object-cover" />
                ) : m.type === "video" ? (
                  <video src={m.url} className="w-full h-28 object-cover" controls />
                ) : (
                  <div className="w-full h-28 bg-gray-800 flex items-center justify-center text-gray-400 text-xs">Embed</div>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteMedia(m.id)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 text-xs text-red-200"
                >
                  <Trash2 className="size-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 mb-4">No media yet.</p>
        )}

        <div className="flex gap-3 items-start flex-wrap">
          <label className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200 cursor-pointer">
            <Upload className="size-4" /> Upload Media
            <input type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={e => { if (e.target.files) onUploadMedia(e.target.files); e.currentTarget.value = ""; }} />
          </label>
        </div>

        <div className="mt-4 border border-gray-800 bg-black/20 p-4">
          <h4 className="font-heading uppercase text-sm text-gray-300 mb-2">Add Media by URL</h4>
          <div className="flex gap-2 flex-wrap">
            <Select value={linkType} onValueChange={v => setLinkType(v as any)}>
              <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="embed">Embed</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="bg-black/40 border-gray-700 text-gray-200 flex-1 min-w-[200px]" />
            <Button onClick={onAddMediaLink} className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminArtProjects() {
  const [projects, setProjects] = React.useState<ArtProjectAdmin[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // New project form
  const [newTitle, setNewTitle] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newShortDesc, setNewShortDesc] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newTags, setNewTags] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListArtProjects();
      setProjects(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load art projects");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!newTitle.trim() || !newShortDesc.trim() || !newDesc.trim()) {
      toast.error("Title, short description, and description are required");
      return;
    }
    const slug = newSlug.trim() || slugify(newTitle);
    try {
      await adminCreateArtProject({
        title: newTitle.trim(),
        slug,
        shortDescription: newShortDesc.trim(),
        description: newDesc.trim(),
        tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setNewTitle(""); setNewSlug(""); setNewShortDesc(""); setNewDesc(""); setNewTags("");
      toast.success("Project created");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this art project and all its media?")) return;
    try {
      await adminDeleteArtProject(id);
      toast.success("Deleted");
      if (editingId === id) setEditingId(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const editingProject = editingId ? projects.find(p => p.id === editingId) : null;

  return (
    <div>
      <PageHeader
        title="Art Projects"
        subtitle="Manage Art Studio projects. Each project has its own page with media gallery."
      />

      <div className="container mx-auto px-4 pb-16">
        {/* Editor */}
        {editingProject && (
          <div className="mb-8">
            <ProjectEditor
              key={editingProject.id}
              project={editingProject}
              onClose={() => setEditingId(null)}
              onSaved={load}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading uppercase text-2xl text-white">Projects</h2>
              <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-black/40" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-200">Loading…</div>
            ) : projects.length ? (
              <div className="mt-6 space-y-4">
                {projects.map(p => (
                  <div key={p.id} className="border-2 border-gray-700 bg-black/20 p-4 flex gap-4 items-start">
                    {p.cover ? (
                      <img src={p.cover} alt={p.title} className="w-24 h-24 object-cover border border-gray-600 shrink-0" />
                    ) : (
                      <div className="w-24 h-24 bg-gray-800/50 border border-gray-600 shrink-0 flex items-center justify-center text-gray-500 text-xs">
                        No cover
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-heading uppercase text-lg text-white">{p.title}</h3>
                      <p className="text-gray-400 text-sm">{p.shortDescription}</p>
                      <p className="text-gray-600 text-xs mt-1">slug: {p.slug}</p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setEditingId(p.id)}
                          className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-1 text-sm font-heading uppercase text-gray-200"
                        >
                          <Edit className="size-3" /> Edit
                        </button>
                        <Link
                          href={`/art-studio/${p.slug}`}
                          className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-1 text-sm font-heading uppercase text-gray-200"
                        >
                          <Eye className="size-3" /> View
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(p.id)}
                          className="inline-flex items-center gap-1 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 text-sm font-heading uppercase text-red-200"
                        >
                          <Trash2 className="size-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-300">
                No art projects yet.
              </div>
            )}
          </div>

          {/* Create new */}
          <div className="border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-xl text-white">New Project</h2>
            <p className="text-gray-400 text-sm mt-1">Create a new art project. You can add media after creating.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <Input value={newTitle} onChange={e => { setNewTitle(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }} placeholder="Helmet — Fire Theme" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="helmet-fire-theme" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Short Description *</label>
                <Input value={newShortDesc} onChange={e => setNewShortDesc(e.target.value)} placeholder="Custom paint with infernal flames" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Description *</label>
                <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detailed description…" className="bg-black/40 border-gray-700 text-gray-200 min-h-[80px]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <Input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="paint, helmet, custom" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <Button type="button" onClick={onCreate} className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
                <Plus className="size-4 mr-2" /> Create Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
