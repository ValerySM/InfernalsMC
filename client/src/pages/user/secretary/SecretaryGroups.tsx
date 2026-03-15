import * as React from "react";
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  getGroupMembers, addGroupMember, removeGroupMember,
  getSecretaryMembers,
} from "@/api/user";
import { toast } from "sonner";

export default function SecretaryGroups() {
  const [groups, setGroups] = React.useState<any[]>([]);
  const [allMembers, setAllMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);
  const [groupMembers, setGroupMembers] = React.useState<any[]>([]);
  const [addUserId, setAddUserId] = React.useState("");

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [gRes, mRes] = await Promise.all([getGroups(), getSecretaryMembers()]);
      if (gRes.ok) setGroups(gRes.data || []);
      if (mRes.ok) setAllMembers(mRes.data || []);
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createGroup({ name: newName.trim(), description: newDesc.trim() });
      toast.success("Group created!");
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      loadData();
    } catch {
      toast.error("Failed to create group.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this group?")) return;
    try {
      await deleteGroup(id);
      toast.success("Group deleted.");
      loadData();
    } catch {
      toast.error("Failed to delete.");
    }
  }

  async function toggleExpand(groupId: string) {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }
    setExpandedGroup(groupId);
    try {
      const res = await getGroupMembers(groupId);
      if (res.ok) setGroupMembers(res.data || []);
    } catch {
      toast.error("Failed to load group members.");
    }
  }

  async function handleAddMember(groupId: string) {
    if (!addUserId) return;
    try {
      await addGroupMember(groupId, addUserId);
      toast.success("Member added!");
      setAddUserId("");
      const res = await getGroupMembers(groupId);
      if (res.ok) setGroupMembers(res.data || []);
      loadData();
    } catch {
      toast.error("Failed to add member.");
    }
  }

  async function handleRemoveMember(groupId: string, userId: string) {
    try {
      await removeGroupMember(groupId, userId);
      toast.success("Member removed.");
      const res = await getGroupMembers(groupId);
      if (res.ok) setGroupMembers(res.data || []);
      loadData();
    } catch {
      toast.error("Failed to remove member.");
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading text-white uppercase">Groups</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 font-heading uppercase transition-colors"
        >
          {showCreate ? "Cancel" : "+ New Group"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-black/50 border border-gray-800 p-4 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Group name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 font-heading uppercase">
            Create
          </button>
        </form>
      )}

      {groups.length === 0 ? (
        <p className="text-gray-500">No groups yet.</p>
      ) : (
        <div className="space-y-3">
          {groups.map((g: any) => (
            <div key={g.id} className="bg-black/50 border border-gray-800">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
                onClick={() => toggleExpand(g.id)}
              >
                <div>
                  <h3 className="text-white font-medium">{g.name}</h3>
                  {g.description && <p className="text-sm text-gray-400">{g.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{g.memberCount || 0} members</span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(g.id); }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {expandedGroup === g.id && (
                <div className="border-t border-gray-800 p-4">
                  <h4 className="text-sm text-gray-400 uppercase mb-2">Members in this group:</h4>
                  {groupMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-3">No members yet.</p>
                  ) : (
                    <div className="space-y-1 mb-3">
                      {groupMembers.map((m: any) => (
                        <div key={m.userId} className="flex items-center justify-between text-sm py-1">
                          <span className="text-white">{m.name} <span className="text-gray-500">({m.email})</span></span>
                          <button
                            onClick={() => handleRemoveMember(g.id, m.userId)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <select
                      value={addUserId}
                      onChange={e => setAddUserId(e.target.value)}
                      className="flex-1 bg-black/60 border border-gray-700 text-white px-2 py-1.5 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="">Select member to add...</option>
                      {allMembers
                        .filter(m => !groupMembers.find((gm: any) => gm.userId === m.id))
                        .map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                        ))}
                    </select>
                    <button
                      onClick={() => handleAddMember(g.id)}
                      disabled={!addUserId}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
