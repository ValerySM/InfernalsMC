import * as React from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  adminListSupportMethods,
  adminCreateSupportMethod,
  adminUpdateSupportMethod,
  adminUploadSupportQr,
  adminDeleteSupportMethod,
  type SupportMethodAdmin,
} from "@/api/admin";

export default function AdminSupport() {
  const [methods, setMethods] = React.useState<SupportMethodAdmin[]>([]);
  const [loading, setLoading] = React.useState(false);

  // New method form
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newLink, setNewLink] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListSupportMethods();
      setMethods(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load support methods");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await adminCreateSupportMethod({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        link: newLink.trim() || undefined,
      });
      setNewTitle(""); setNewDesc(""); setNewLink("");
      toast.success("Support method added");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this support method?")) return;
    try {
      await adminDeleteSupportMethod(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const onUploadQr = async (id: string, file: File) => {
    try {
      await adminUploadSupportQr(id, file);
      toast.success("QR image uploaded");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const onUpdateField = async (id: string, field: string, value: string) => {
    try {
      await adminUpdateSupportMethod(id, { [field]: value.trim() || undefined });
      toast.success("Updated");
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Support Methods"
        subtitle="Manage donation/support methods displayed on the Support page. Upload QR codes and set links."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading uppercase text-2xl text-white">Methods</h2>
              <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-black/40" onClick={load} disabled={loading}>
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-200">Loading…</div>
            ) : methods.length ? (
              <div className="mt-6 space-y-4">
                {methods.map(m => (
                  <div key={m.id} className="border-2 border-gray-700 bg-black/20 p-4">
                    <div className="flex gap-4 items-start">
                      {/* QR preview */}
                      <div className="shrink-0 w-28">
                        {m.qrImage ? (
                          <img src={m.qrImage} alt={`${m.title} QR`} className="w-full h-28 object-contain bg-white border border-gray-600" />
                        ) : (
                          <div className="w-full h-28 bg-gray-800/50 border border-gray-600 flex items-center justify-center text-gray-500 text-xs">
                            No QR
                          </div>
                        )}
                        <label className="mt-2 inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-2 py-1 text-xs font-heading uppercase text-gray-200 cursor-pointer w-full justify-center">
                          <Upload className="size-3" /> QR
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) onUploadQr(m.id, f);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {/* Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Title</label>
                          <Input
                            defaultValue={m.title}
                            className="bg-black/40 border-gray-700 text-gray-200"
                            onBlur={e => {
                              if (e.target.value.trim() !== m.title) onUpdateField(m.id, "title", e.target.value);
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Description</label>
                          <Input
                            defaultValue={m.description || ""}
                            placeholder="Optional description"
                            className="bg-black/40 border-gray-700 text-gray-200"
                            onBlur={e => onUpdateField(m.id, "description", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Link</label>
                          <Input
                            defaultValue={m.link || ""}
                            placeholder="https://..."
                            className="bg-black/40 border-gray-700 text-gray-200"
                            onBlur={e => onUpdateField(m.id, "link", e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onDelete(m.id)}
                            className="inline-flex items-center gap-1 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 text-sm font-heading uppercase text-red-200"
                          >
                            <Trash2 className="size-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-300">
                No support methods yet.
              </div>
            )}
          </div>

          {/* Create new */}
          <div className="border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-xl text-white">Add Method</h2>
            <p className="text-gray-400 text-sm mt-1">Add a new support/donation method. Upload QR after creating.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="BIT / PayBox" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Fast support via local wallet" className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link</label>
                <Input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://..." className="bg-black/40 border-gray-700 text-gray-200" />
              </div>
              <Button type="button" onClick={onCreate} className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
                <Plus className="size-4 mr-2" /> Add Method
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
