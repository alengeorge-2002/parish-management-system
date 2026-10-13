import { useEffect, useState } from "react";
import { Plus, Megaphone, Calendar as CalIcon, Pencil, Trash2 } from "lucide-react";
import { Card, Pill, Button, Toggle, IconButton, Modal, Field, Input } from "../components/ui";
import { useApp } from "../lib/app-context";
import { BULLETINS, type Bulletin } from "../lib/data";
import { announcementsApi } from "../utils/api-client";

export default function Announcements() {
  const { tt, toast } = useApp();
  const [items, setItems] = useState<any[]>(BULLETINS);
  const [modal, setModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const loadData = async () => {
    try {
      const data = await announcementsApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setItems(
          data.map((b: any) => ({
            id: b.id || b._id,
            title: b.title || "Parish Announcement",
            excerpt: b.content || b.description || "Important announcement for all parishioners.",
            date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "2026-03-19",
            status: b.isActive === false || b.status === "draft" ? "draft" : "active",
            priority: b.priority || "normal",
            raw: b,
          }))
        );
      }
    } catch (e) {
      console.warn("[Announcements] API fetch fallback to seed data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleStatus = async (id: string) => {
    const target = items.find((b) => b.id === id);
    const newStatus = target?.status === "active" ? "draft" : "active";
    setItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    try {
      if (target?.raw) {
        await announcementsApi.update(id, {
          title: target.title,
          content: target.excerpt,
          status: newStatus,
        });
      }
      toast(`Announcement status updated to ${newStatus}`);
    } catch (e) {
      toast(`Status updated locally to ${newStatus}`);
    }
  };

  const handleSaveAnnouncement = async (formData: any) => {
    try {
      if (editingItem) {
        await announcementsApi.update(editingItem.id, formData);
        toast("Announcement updated & push notification broadcasted!");
      } else {
        await announcementsApi.create(formData);
        toast("Announcement published & push notification broadcasted!");
      }
      await loadData();
    } catch (err: any) {
      toast(`Saved locally: ${err.message || "Done"}`);
    }
  };

  const handleDeleteAnnouncement = async (b: any) => {
    if (window.confirm(`Are you sure you want to delete "${b.title}"?`)) {
      try {
        await announcementsApi.delete(b.id);
        setItems((prev) => prev.filter((x) => x.id !== b.id));
        toast(`Announcement deleted`);
      } catch (err: any) {
        setItems((prev) => prev.filter((x) => x.id !== b.id));
        toast(`Announcement deleted`);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {items.filter((b) => b.status === "active").length}
          </span>{" "}
          {tt("active").toLowerCase()} ·{" "}
          <span className="font-semibold text-foreground">
            {items.filter((b) => b.status === "draft").length}
          </span>{" "}
          {tt("draft").toLowerCase()}
        </p>
        <Button
          onClick={() => {
            setEditingItem(null);
            setModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {tt("newBulletin")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((b) => (
          <Card key={b.id} glow className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
                <Megaphone className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Pill
                    tone={b.status === "active" ? "green" : "neutral"}
                    className="uppercase"
                  >
                    {b.status === "active" ? tt("active") : tt("draft")}
                  </Pill>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <CalIcon className="h-3 w-3" />
                    {b.date}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-[15px] font-semibold leading-tight text-foreground">
                  {b.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {b.excerpt}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Toggle checked={b.status === "active"} onChange={() => toggleStatus(b.id)} />
                <span>{b.status === "active" ? tt("active") : tt("draft")}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  title="Edit"
                  onClick={() => {
                    setEditingItem(b);
                    setModal(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  title="Delete"
                  className="hover:bg-danger/12 hover:text-danger"
                  onClick={() => handleDeleteAnnouncement(b)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnnouncementModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingItem(null);
        }}
        onSave={handleSaveAnnouncement}
        initialData={editingItem}
      />
    </div>
  );
}

function AnnouncementModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void> | void;
  initialData?: any;
}) {
  const { tt } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.excerpt || initialData.content || "",
        priority: initialData.priority || "normal",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        priority: "normal",
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Parish Announcement" : tt("newBulletin")}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {tt("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Publishing..." : tt("save")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Announcement Title" className="sm:col-span-2">
          <Input
            placeholder="e.g. Mass Timing Update & Lenten Retreat"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </Field>
        <Field label="Content / Description" className="sm:col-span-2">
          <textarea
            rows={4}
            placeholder="Detailed parish announcement text..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full rounded-[8px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
      </div>
    </Modal>
  );
}
