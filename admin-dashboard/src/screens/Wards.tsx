import { useEffect, useState } from "react";
import { MapPin, Phone, Users, ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, Button, IconButton } from "../components/ui";
import { WardModal } from "../components/modals";
import { WardHouseholdsModal } from "../components/WardHouseholdsModal";
import { useApp } from "../lib/app-context";
import { fetchApi, wardsApi, familiesApi, membersApi } from "../utils/api-client";
import { getWardRepresentative } from "../utils/getWardRepresentative";

export default function Wards() {
  const { tt, lang, toast } = useApp();
  const [modal, setModal] = useState(false);
  const [editingWard, setEditingWard] = useState<any>(null);
  const [selectedWardForHouseholds, setSelectedWardForHouseholds] = useState<any>(null);

  const [wardsList, setWardsList] = useState<any[]>([]);
  const [familiesList, setFamiliesList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);

  const [unitModalWard, setUnitModalWard] = useState<any>(null);
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const [submittingUnit, setSubmittingUnit] = useState(false);

  const handleOpenWardHouseholds = (w: any) => {
    setSelectedWardForHouseholds(w);
  };

  const loadData = async () => {
    try {
      const res = await fetchApi("/wards");
      const data = Array.isArray(res) ? res : res?.wards || [];
      setWardsList(data);

      const [familiesData, membersData] = await Promise.all([
        familiesApi.list().catch(() => []),
        membersApi.list().catch(() => []),
      ]);
      if (Array.isArray(familiesData)) setFamiliesList(familiesData);
      if (Array.isArray(membersData)) setMembersList(membersData);
    } catch (e) {
      console.error("[Wards] Error fetching wards:", e);
    }
  };

  useEffect(() => {
    fetchApi("/wards")
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res?.wards || [];
        setWardsList(data);
      })
      .catch((err) => console.error("Error fetching wards:", err));
    loadData();
  }, []);

  const handleSaveWard = async (formData: any) => {
    try {
      if (editingWard) {
        await wardsApi.update(editingWard.id || editingWard._id, formData);
        toast("Ward subdivision updated successfully");
      } else {
        await wardsApi.create(formData);
        toast("New ward subdivision created");
      }
      await loadData();
    } catch (err: any) {
      toast(`Save notice: ${err.message || "Saved locally"}`);
    }
  };

  const handleDeleteWard = async (w: any) => {
    const wardNum = w.ward_number || w.wardNumber || w.number;
    const wardTitle = w.ward_name || w.wardName || w.patron;
    if (window.confirm(`Are you sure you want to delete Ward #${wardNum} - ${wardTitle}?`)) {
      try {
        await wardsApi.delete(w.id || w._id);
        setWardsList((prev) => prev.filter((x) => (x.id || x._id) !== (w.id || w._id)));
        toast(`Ward #${wardNum} deleted`);
      } catch (err: any) {
        setWardsList((prev) => prev.filter((x) => (x.id || x._id) !== (w.id || w._id)));
        toast(`Ward #${wardNum} deleted`);
      }
    }
  };

  const handleAddUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitModalWard || !newUnitNumber.trim()) return;
    setSubmittingUnit(true);
    try {
      await fetchApi(`/wards/${unitModalWard._id || unitModalWard.id}/units`, {
        method: "POST",
        body: JSON.stringify({
          unitNumber: newUnitNumber.trim(),
          unit_number: newUnitNumber.trim(),
        }),
      });
      await loadData();
      setUnitModalWard(null);
      setNewUnitNumber("");
      toast("Unit added successfully");
    } catch (err: any) {
      console.error("Failed to add unit:", err);
      toast(`Failed to add unit: ${err.message || err}`);
    } finally {
      setSubmittingUnit(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium text-muted-foreground">
          Total Wards: <span className="font-semibold text-foreground">{wardsList.length}</span>
        </div>
        <Button
          onClick={() => {
            setEditingWard(null);
            setModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add Ward Subdivision" : "വാർഡ് ചേർക്കുക"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {wardsList.map((w: any) => {
          const wardTitle = w.ward_name || w.wardName || w.patron || `Ward ${w.ward_number || w.wardNumber || w.number}`;
          const wardNum = w.ward_number || w.wardNumber || w.number;
          const { repName, repPhone } = getWardRepresentative(w);
          const unitsList = Array.isArray(w.units) ? w.units : [];
          const wardFamilyCount = w.totalFamilies || familiesList.filter(
            (f: any) => Number(f.wardId || f.wardNumber || f.ward) === Number(wardNum)
          ).length || w.families || 0;

          return (
            <Card
              key={w._id || w.id || wardNum}
              glow
              className="p-5 cursor-pointer transition-all hover:border-primary/40"
              onClick={() => handleOpenWardHouseholds(w)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-primary/12 font-display text-[16px] font-bold text-primary">
                  {wardNum}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    Ward #{wardNum}
                  </div>
                  <h3 className="font-display text-[15px] font-semibold text-foreground">
                    {wardTitle}
                  </h3>
                  {w.patronMl && (
                    <div className="font-malayalam text-[12px] text-muted-foreground">
                      {w.patronMl}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2.5 rounded-[10px] border border-border bg-secondary/30 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {tt("wardRep")}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-foreground">{repName}</span>
                  <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-info" />
                    {repPhone}
                  </span>
                </div>
              </div>

              {/* Units Pills & Add Unit Button */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {unitsList.map((u: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded bg-[#1e222b] text-[#F4C430] border border-[#2d323e]"
                  >
                    {typeof u === "string" ? u : u.unitNumber || u.unit_number || `Unit ${idx + 1}`}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnitModalWard(w);
                  }}
                  className="px-2 py-0.5 text-xs rounded border border-dashed border-[#F4C430]/50 text-[#F4C430] hover:bg-[#F4C430]/10 transition-colors"
                >
                  + Add Unit
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="font-display text-[16px] font-bold text-foreground">
                      {wardFamilyCount}
                    </span>{" "}
                    <span className="text-[12px] text-muted-foreground">{tt("families")}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    className="px-2.5 py-1.5 text-[12px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWardHouseholds(w);
                    }}
                  >
                    {tt("viewHouseholds")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <IconButton
                    title={lang === "en" ? "Edit ward" : "വാർഡ് തിരുത്തുക"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingWard(w);
                      setModal(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    title="Delete"
                    className="hover:bg-danger/12 hover:text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWard(w);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <WardModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingWard(null);
        }}
        onSave={handleSaveWard}
        initialData={editingWard}
      />

      <WardHouseholdsModal
        open={Boolean(selectedWardForHouseholds)}
        onClose={() => setSelectedWardForHouseholds(null)}
        ward={selectedWardForHouseholds}
        families={familiesList}
        members={membersList}
      />

      {/* Add Unit Modal */}
      {unitModalWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#232833] bg-[#15181e] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#232833]">
              <h3 className="text-lg font-semibold text-foreground">
                Add Unit to {unitModalWard.ward_name || unitModalWard.wardName || unitModalWard.patron || `Ward #${unitModalWard.ward_number || unitModalWard.wardNumber}`}
              </h3>
              <button
                onClick={() => {
                  setUnitModalWard(null);
                  setNewUnitNumber("");
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddUnitSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Unit Designation / Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit V"
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  className="w-full rounded-lg border border-[#232833] bg-[#1a1f27] px-3 py-2 text-sm text-foreground focus:border-[#F4C430] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setUnitModalWard(null);
                    setNewUnitNumber("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingUnit || !newUnitNumber.trim()}>
                  {submittingUnit ? "Saving..." : "Add Unit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
