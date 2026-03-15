import * as React from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Upload, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAddGalleryLink, adminDeleteGallery, adminListGallery, adminUpdateGallery, adminUploadGallery, type GalleryItem } from "@/api/admin";

function Preview({ item }: { item: GalleryItem }) {
  if (item.type === "image") {
    return (
      <a href={item.url} target="_blank" rel="noreferrer" className="block border-2 border-gray-700 bg-black/30 overflow-hidden">
        <img src={item.url} alt={(item as any).alt || ""} className="w-full h-52 object-cover" loading="lazy" />
      </a>
    );
  }
  if (item.type === "video") {
    return (
      <div className="border-2 border-gray-700 bg-black/30">
        <video controls className="w-full h-52 object-cover" src={item.url} />
      </div>
    );
  }
  return (
    <div className="border-2 border-gray-700 bg-black/30">
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={item.url}
          title={(item as any).title || "Embedded"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default function AdminGallery() {
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListGallery();
      setItems(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (files: FileList) => {
    try {
      const arr = Array.from(files);
      for (const f of arr) {
        await adminUploadGallery(f);
      }
      toast.success("Uploaded");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await adminDeleteGallery(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const onSaveCaption = async (id: string, caption: string) => {
    try {
      await adminUpdateGallery(id, { caption: caption.trim() || null });
      toast.success("Saved");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const [linkType, setLinkType] = React.useState<"embed" | "video" | "image">("embed");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkCaption, setLinkCaption] = React.useState("");
  const [linkTitle, setLinkTitle] = React.useState("");

  const onAddLink = async () => {
    if (!linkUrl.trim()) {
      toast.error("URL is required");
      return;
    }
    try {
      await adminAddGalleryLink({
        type: linkType,
        url: linkUrl.trim(),
        caption: linkCaption.trim() || undefined,
        title: linkTitle.trim() || undefined,
      });
      setLinkUrl("");
      setLinkCaption("");
      setLinkTitle("");
      toast.success("Added");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add");
    }
  };

  return (
    <div>
      <PageHeader
        title="Manage Gallery"
        subtitle="Homepage gallery items. Upload images or add embeds/videos by URL."
      />

      <div className="container mx-auto px-4 pb-16">
        {error ? (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-4 mb-6">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading uppercase text-2xl text-white">Items</h2>
              <Button
                type="button"
                variant="outline"
                className="border-gray-700 text-gray-200 hover:bg-black/40"
                onClick={load}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-200">Loading…</div>
            ) : items.length ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map(it => (
                  <div key={it.id} className="border-2 border-gray-700 bg-black/20 p-3">
                    <Preview item={it} />
                    <div className="mt-3">
                      <Input
                        defaultValue={it.caption || ""}
                        placeholder="Caption (optional)"
                        className="bg-black/40 border-gray-700 text-gray-200"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            onSaveCaption(it.id, (e.target as HTMLInputElement).value);
                          }
                        }}
                        onBlur={e => onSaveCaption(it.id, e.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDelete(it.id)}
                        className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 font-heading uppercase text-red-200"
                      >
                        <Trash2 className="size-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-300">
                No gallery items yet.
              </div>
            )}
          </div>

          <div className="border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-xl text-white">Upload</h2>
            <p className="text-gray-400 text-sm mt-1">Upload one or more images/videos to the homepage gallery.</p>

            <div className="mt-4">
              <label className="inline-flex items-center justify-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200 cursor-pointer w-full">
                <Upload className="size-4" /> Upload Files
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  multiple
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) onUpload(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-8 border border-gray-800 bg-black/20 p-4">
              <h3 className="font-heading uppercase text-gray-300">Add by URL</h3>
              <div className="mt-3 space-y-2">
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
                <Input value={linkCaption} onChange={e => setLinkCaption(e.target.value)} placeholder="Caption (optional)" className="bg-black/40 border-gray-700 text-gray-200" />
                {(linkType === "embed" || linkType === "video") ? (
                  <Input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} placeholder="Title (optional)" className="bg-black/40 border-gray-700 text-gray-200" />
                ) : null}
                <Button type="button" onClick={onAddLink} className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
                  <Plus className="size-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
