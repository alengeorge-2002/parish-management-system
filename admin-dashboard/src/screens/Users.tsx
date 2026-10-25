import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  Pill,
  Button,
  IconButton,
  Modal,
  Field,
  Input,
  Select,
  EmptyState,
} from "../components/ui";
import { useApp } from "../lib/app-context";
import { usersApi, membersApi } from "../utils/api-client";

export default function Users() {
  const { toast } = useApp();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState("parishioner");
  const [customAccessKey, setCustomAccessKey] = useState("");

  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, membersData] = await Promise.all([
        usersApi.list(),
        membersApi.list().catch(() => []),
      ]);

      const users = Array.isArray(usersData) ? usersData : [];
      setUsersList(users);

      const members = Array.isArray(membersData) ? membersData : [];
      setMembersList(members);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      toast(`Failed to load users: ${err.message}`);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRevealKey = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast("Access key copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setSelectedMemberId(membersList[0]?.id ? String(membersList[0].id) : "");
    setSelectedRole("parishioner");
    setCustomAccessKey("");
    setModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role || "parishioner");
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id || editingUser._id, selectedRole);
        toast(`User role updated to ${selectedRole}`);
      } else {
        if (!selectedMemberId) {
          toast("Please select a parish member");
          return;
        }
        await usersApi.create(selectedMemberId, selectedRole, customAccessKey.trim());
        toast("New user account created successfully");
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast(`Error saving user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user: any) => {
    const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.access_key;
    if (window.confirm(`Are you sure you want to revoke credentials for ${userName}?`)) {
      try {
        await usersApi.delete(user.id || user._id);
        toast("User account removed");
        await loadData();
      } catch (err: any) {
        toast(`Error deleting user: ${err.message}`);
      }
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const nameMatch = `${u.first_name || ""} ${u.last_name || ""} ${u.access_key || ""} ${u.email || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const roleMatch = roleFilter === "all" || u.role === roleFilter;
    return nameMatch && roleMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, role, email, access key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="w-40">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="parishioner">Parishioner</option>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadData} disabled={loading} title="Refresh accounts">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add User Account
          </Button>
        </div>
      </div>

      {/* Database User Accounts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border bg-secondary/50 font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Access Key</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const isAdmin = user.role === "admin";
                const isKeyRevealed = Boolean(revealedKeys[user.id]);
                const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || (isAdmin ? "Admin User" : "Parishioner User");

                return (
                  <tr key={user.id || user._id} className="transition-colors hover:bg-secondary/30">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                            isAdmin
                              ? "bg-primary/20 text-primary border border-primary/40"
                              : "bg-info/20 text-info border border-info/40"
                          }`}
                        >
                          {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{fullName}</div>
                          <div className="text-[11px] text-muted-foreground">{user.email || "No email linked"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <Pill tone="gold">
                          <Shield className="h-3 w-3" />
                          Administrator
                        </Pill>
                      ) : (
                        <Pill tone="blue">
                          <UserCheck className="h-3 w-3" />
                          Parishioner
                        </Pill>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-secondary/70 px-2 py-1 font-mono text-[12px] font-semibold text-foreground">
                          {isKeyRevealed ? user.access_key : "••••••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleRevealKey(user.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title={isKeyRevealed ? "Hide Key" : "Reveal Key"}
                        >
                          {isKeyRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(user.access_key, user.id)}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copy Access Key"
                        >
                          {copiedId === user.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Pill tone="green">Active</Pill>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton onClick={() => openEditModal(user)} title="Edit Role">
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user)} title="Revoke Account">
                          <Trash2 className="h-3.5 w-3.5 text-danger" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <EmptyState
                      icon={<Shield className="h-6 w-6 text-muted-foreground" />}
                      title="No active user credentials found in the database."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? "Edit User Role" : "Create New User Account"}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          {!editingUser && (
            <Field label="Link to Parish Member">
              <Select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
              >
                {membersList.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {`${m.firstName || m.first_name || ""} ${m.lastName || m.last_name || ""}`.trim() || `Member #${m.id}`}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Account Role">
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
            >
              <option value="parishioner">Parishioner (Regular Directory Access)</option>
              <option value="admin">Administrator (Full Sanctum Access)</option>
            </Select>
          </Field>

          {!editingUser && (
            <Field label="Access Key (Optional: leave blank to auto-generate)">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. user_custom_pass123"
                  value={customAccessKey}
                  onChange={(e) => setCustomAccessKey(e.target.value)}
                  className="pl-9 font-mono"
                />
              </div>
            </Field>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? "Update Role" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
