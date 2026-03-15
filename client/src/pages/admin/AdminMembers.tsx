import * as React from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload, User, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import {
  adminListMembers,
  adminCreateMember,
  adminUpdateMember,
  adminUploadMemberPhoto,
  adminDeleteMember,
  type ClubMemberAdmin,
} from "@/api/admin";

export default function AdminMembers() {
  const [members, setMembers] = React.useState<ClubMemberAdmin[]>([]);
  const [loading, setLoading] = React.useState(false);

  // New member form
  const [newName, setNewName] = React.useState("");
  const [newRole, setNewRole] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await adminListMembers();
      setMembers(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!newName.trim() || !newRole.trim()) {
      toast.error("Name and role are required");
      return;
    }
    try {
      await adminCreateMember({ name: newName.trim(), role: newRole.trim() });
      setNewName("");
      setNewRole("");
      toast.success("Member added");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to create member");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try {
      await adminDeleteMember(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const onUploadPhoto = async (id: string, file: File) => {
    try {
      await adminUploadMemberPhoto(id, file);
      toast.success("Photo uploaded");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  };

  const onUpdateField = async (id: string, field: "name" | "role", value: string) => {
    try {
      await adminUpdateMember(id, { [field]: value });
      toast.success("Updated");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    }
  };

  const onMove = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= members.length) return;
    try {
      const m = members[index];
      const target = members[newIndex];
      // Swap sort orders
      await adminUpdateMember(m.id, { sortOrder: target.sortOrder });
      await adminUpdateMember(target.id, { sortOrder: m.sortOrder });
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Reorder failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Club Members"
        subtitle="Manage club officers displayed on the homepage. Add photos, edit names and roles."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Members list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-heading uppercase text-2xl text-white">Members</h2>
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
            ) : members.length ? (
              <div className="mt-6 space-y-4">
                {members.map((m, idx) => (
                  <div key={m.id} className="border-2 border-gray-700 bg-black/20 p-4 flex gap-4 items-start">
                    {/* Photo */}
                    <div className="shrink-0 w-24 h-24">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover border border-gray-600" />
                      ) : (
                        <div className="w-full h-full bg-gray-800/50 border border-gray-600 flex items-center justify-center text-gray-400">
                          <User className="size-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          defaultValue={m.name}
                          placeholder="Name"
                          className="bg-black/40 border-gray-700 text-gray-200"
                          onBlur={e => {
                            if (e.target.value.trim() !== m.name) onUpdateField(m.id, "name", e.target.value.trim());
                          }}
                        />
                        <Input
                          defaultValue={m.role}
                          placeholder="Role"
                          className="bg-black/40 border-gray-700 text-gray-200"
                          onBlur={e => {
                            if (e.target.value.trim() !== m.role) onUpdateField(m.id, "role", e.target.value.trim());
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <label className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-1 text-sm font-heading uppercase text-gray-200 cursor-pointer">
                          <Upload className="size-3" /> Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (f) onUploadPhoto(m.id, f);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => onMove(idx, -1)}
                          disabled={idx === 0}
                          className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-2 py-1 text-gray-200 disabled:opacity-30"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMove(idx, 1)}
                          disabled={idx === members.length - 1}
                          className="inline-flex items-center gap-1 border border-gray-700 bg-black/30 hover:bg-black/50 px-2 py-1 text-gray-200 disabled:opacity-30"
                        >
                          <ArrowDown className="size-4" />
                        </button>
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
                ))}
              </div>
            ) : (
              <div className="mt-6 border-2 border-gray-700 bg-black/30 p-6 text-gray-300">
                No members yet. Add the first one.
              </div>
            )}
          </div>

          {/* Add new */}
          <div className="border-2 border-gray-700 bg-black/30 p-6">
            <h2 className="font-heading uppercase text-xl text-white">Add Member</h2>
            <p className="text-gray-400 text-sm mt-1">Add a new club officer. You can upload a photo after creating.</p>

            <div className="mt-4 space-y-3">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Name (e.g. STAS)"
                className="bg-black/40 border-gray-700 text-gray-200"
              />
              <Input
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                placeholder="Role (e.g. PRESIDENT)"
                className="bg-black/40 border-gray-700 text-gray-200"
              />
              <Button
                type="button"
                onClick={onCreate}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase"
              >
                <Plus className="size-4 mr-2" /> Add Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
