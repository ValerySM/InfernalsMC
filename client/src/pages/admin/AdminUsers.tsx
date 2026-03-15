import * as React from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { adminCreateUser, adminDeleteUser, adminListUsers, adminUpdateUser, type AdminUser } from "@/api/admin";
import { useAdminSession } from "@/contexts/AdminSessionContext";

type UserForm = {
  email: string;
  name: string;
  password: string;
  role: "admin" | "superadmin";
  isActive: boolean;
};

function emptyUserForm(): UserForm {
  return { email: "", name: "", password: "", role: "admin", isActive: true };
}

export default function AdminUsers() {
  const { user: me } = useAdminSession();
  const isSuper = me?.role === "superadmin";

  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminListUsers();
      setUsers(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Create dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createForm, setCreateForm] = React.useState<UserForm>(emptyUserForm());

  const onCreate = async () => {
    if (!createForm.email.trim() || !createForm.name.trim() || !createForm.password) {
      toast.error("Name, email and password are required");
      return;
    }
    try {
      await adminCreateUser({
        email: createForm.email.trim(),
        name: createForm.name.trim(),
        password: createForm.password,
        role: isSuper ? createForm.role : "admin",
        isActive: createForm.isActive,
      });
      toast.success("Admin user created");
      setCreateOpen(false);
      setCreateForm(emptyUserForm());
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    }
  };

  // Edit dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<UserForm>>({});

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      password: "",
    });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editUser) return;
    try {
      await adminUpdateUser(editUser.id, {
        name: editForm.name?.trim(),
        isActive: editForm.isActive,
        password: editForm.password ? editForm.password : undefined,
        role: isSuper ? (editForm.role as any) : undefined,
      });
      toast.success("Saved");
      setEditOpen(false);
      setEditUser(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await adminDeleteUser(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Users"
        subtitle="Manage who can access the admin area. Passwords are stored hashed in PostgreSQL."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="border-gray-700 text-gray-200 hover:bg-black/40"
            onClick={load}
            disabled={loading}
          >
            Refresh
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase">
                <Plus className="size-4 mr-2" /> New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-gray-800 bg-black text-gray-200">
              <DialogHeader>
                <DialogTitle className="font-heading uppercase text-red-500">Create Admin User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  This creates a new login for /admin.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Name</label>
                  <Input value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} className="bg-black/40 border-gray-700 text-gray-200" />
                </div>
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Email</label>
                  <Input value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} className="bg-black/40 border-gray-700 text-gray-200" />
                </div>
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Password</label>
                  <Input type="password" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} className="bg-black/40 border-gray-700 text-gray-200" />
                </div>
                {isSuper ? (
                  <div>
                    <label className="block font-heading uppercase text-gray-300 mb-2">Role</label>
                    <Select value={createForm.role} onValueChange={v => setCreateForm(p => ({ ...p, role: v as any }))}>
                      <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="superadmin">superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Only superadmins can create other superadmins.</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-heading uppercase text-gray-300">Active</span>
                  <Switch checked={createForm.isActive} onCheckedChange={v => setCreateForm(p => ({ ...p, isActive: v }))} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-black/40" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error ? (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 text-red-200 p-4">{error}</div>
        ) : null}

        <div className="mt-8 border-2 border-gray-700 bg-black/30 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-800">
              <tr className="text-gray-400 font-heading uppercase text-sm">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-200">Loading…</td></tr>
              ) : users.length ? (
                users.map(u => (
                  <tr key={u.id} className="border-b border-gray-800 last:border-0">
                    <td className="px-4 py-3 text-white">{u.name}{u.id === me?.id ? <span className="text-gray-500"> (you)</span> : null}</td>
                    <td className="px-4 py-3 text-gray-300">{u.email}</td>
                    <td className="px-4 py-3 text-gray-300 uppercase">{u.role}</td>
                    <td className="px-4 py-3 text-gray-300">{u.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-2 font-heading uppercase text-gray-200"
                        >
                          <Pencil className="size-4" /> Edit
                        </button>
                        {isSuper && u.id !== me?.id ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 font-heading uppercase text-red-200"
                              >
                                <Trash2 className="size-4" /> Delete
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border border-gray-800 bg-black text-gray-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-heading uppercase text-red-500">Delete user?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This will permanently delete {u.email}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-700 text-gray-200 hover:bg-black/40">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => onDelete(u.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-4 py-6 text-gray-300">No users.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="border border-gray-800 bg-black text-gray-200">
            <DialogHeader>
              <DialogTitle className="font-heading uppercase text-red-500">Edit Admin User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update name, role (superadmin only), password or active state.
              </DialogDescription>
            </DialogHeader>

            {editUser ? (
              <div className="space-y-3">
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Name</label>
                  <Input value={editForm.name || ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="bg-black/40 border-gray-700 text-gray-200" />
                </div>
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">Email</label>
                  <Input value={editUser.email} disabled className="bg-black/30 border-gray-800 text-gray-500" />
                </div>
                <div>
                  <label className="block font-heading uppercase text-gray-300 mb-2">New Password (optional)</label>
                  <Input type="password" value={editForm.password || ""} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} className="bg-black/40 border-gray-700 text-gray-200" />
                </div>
                {isSuper ? (
                  <div>
                    <label className="block font-heading uppercase text-gray-300 mb-2">Role</label>
                    <Select value={(editForm.role as any) || editUser.role} onValueChange={v => setEditForm(p => ({ ...p, role: v as any }))}>
                      <SelectTrigger className="bg-black/40 border-gray-700 text-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">admin</SelectItem>
                        <SelectItem value="superadmin">superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="font-heading uppercase text-gray-300">Active</span>
                  <Switch checked={Boolean(editForm.isActive)} onCheckedChange={v => setEditForm(p => ({ ...p, isActive: v }))} />
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-black/40" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
