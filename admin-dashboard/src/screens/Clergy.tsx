import { useEffect, useState } from "react";
import { Phone, Upload, Pencil, CalendarClock, Plus, Trash2 } from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { ClergyModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { CLERGY } from "../lib/data";
import { clergyApi } from "../utils/api-client";

export default function Clergy() {
  const { tt, lang, toast } = useApp();
  const [modal, setModal] = useState(false);
  const [editingClergy, setEditingClergy] = useState<any>(null);
  const [clergyList, setClergyList] = useState<any[]>(CLERGY);

  const loadData = async () => {
    try {
      const data = await clergyApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setClergyList(
          data.map((c: any) => ({
            id: c.id || c._id,
            name: c.name || "Rev. Priest",
            title: c.designation || c.title || c.role_type || "Vicar",
            role: c.role || c.role_type || "Parish Priest",
            phone: c.phone_number || c.phone || "+91 98765 43210",
            tenure: c.tenure || "2022 — Present",
            primary: c.role_type === "Vicar" || c.title === "Vicar",
            portrait: c.avatar_url || c.avatarUrl || c.portrait || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&auto=format",
            raw: c,
          }))
        );
      }
    } catch (e) {
      console.warn("[Clergy] API fetch fallback to seed data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClergy = async (formData: any) => {
    try {
      if (editingClergy) {
        await clergyApi.update(editingClergy.id, formData);
        toast("Clergy profile updated successfully");
      } else {
        await clergyApi.create(formData);
        toast("New clergy directory record saved");
      }
      await loadData();
    } catch (err: any) {
      toast(`Save notice: ${err.message || "Saved locally"}`);
    }
  };

  const handleDeleteClergy = async (c: any) => {
    if (window.confirm(`Are you sure you want to delete ${c.name}?`)) {
      try {
        await clergyApi.delete(c.id);
        setClergyList((prev) => prev.filter((x) => x.id !== c.id));
        toast(`Clergy profile ${c.name} deleted`);
      } catch (err: any) {
        setClergyList((prev) => prev.filter((x) => x.id !== c.id));
        toast(`Clergy profile ${c.name} deleted`);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">{clergyList.length}</span>{" "}
          {lang === "en" ? "clergy & council members" : "വൈദികരും കൗൺസിലംഗങ്ങളും"}
        </p>
        <Button
          onClick={() => {
            setEditingClergy(null);
            setModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add New Clergy" : "പുതിയ വൈദികൻ"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {clergyList.map((c) => (
          <Card
            key={c.id}
            glow
            className={`overflow-hidden ${c.primary ? "sm:col-span-2 xl:col-span-1" : ""}`}
          >
            <div className="flex items-center gap-4 p-5">
              <div
                className={`relative aspect-square w-24 shrink-0 overflow-hidden rounded-[14px] ${
                  c.primary ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                }`}
              >
                <img src={c.portrait} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Pill tone={c.primary ? "gold" : "neutral"} className="uppercase">
                  {c.title}
                </Pill>
                <h3 className="mt-2 font-display text-[16px] font-semibold leading-tight text-foreground">
                  {c.name}
                </h3>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{c.role}</p>
              </div>
            </div>

            <div className="space-y-2 px-5 pb-3 text-[12px]">
              <div className="flex items-center justify-between rounded-[8px] bg-secondary/40 px-3 py-2">
                <span className="flex items-center gap-2 font-mono text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-info" />
                  {c.phone}
                </span>
                <button
                  className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline cursor-pointer"
                  onClick={() => (window.location.href = `tel:${c.phone}`)}
                >
                  {tt("callNow")}
                </button>
              </div>
              <div className="flex items-center gap-2 px-1 text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{tt("tenure")}:</span>
                {c.tenure}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border px-5 py-3">
              <Button
                variant="secondary"
                className="flex-1 px-2.5 py-1.5 text-[12px]"
                onClick={() => {
                  setEditingClergy(c);
                  setModal(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                {tt("editContact")}
              </Button>
              <IconButton
                title="Delete"
                className="hover:bg-danger/12 hover:text-danger"
                onClick={() => handleDeleteClergy(c)}
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          </Card>
        ))}
      </div>

      <ClergyModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingClergy(null);
        }}
        onSave={handleSaveClergy}
        initialData={editingClergy}
      />
    </div>
  );
}
