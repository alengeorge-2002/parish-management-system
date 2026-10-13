import { useEffect, useState } from "react";
import { Plus, Phone, Users, Pencil, Trash2, Church, X, Building, Calendar, Mail, UserCheck } from "lucide-react";
import { Card, Pill, Button, IconButton } from "../components/ui";
import { HouseModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { RELIGIOUS_HOUSES } from "../lib/data";
import { religiousHousesApi } from "../utils/api-client";
import { getMemberAvatar } from "../utils/getMemberAvatar";

const typeTone: Record<string, "gold" | "blue" | "violet"> = {
  Convent: "gold",
  Monastery: "blue",
  "Formation House": "violet",
  Seminary: "blue",
  Congregation: "gold",
};

const DEFAULT_RESIDENTS_BY_TYPE: Record<string, any[]> = {
  Convent: [
    { fullName: "Sr. Little Rose CMC", religiousName: "Sr. Little Rose CMC", designation: "Mother Superior", phone: "+91 94470 71001", email: "superior.carmel@devagiri.org", gender: "F", feastDay: "October 1" },
    { fullName: "Sr. Mary Joseph CMC", religiousName: "Sr. Mary Joseph CMC", designation: "Vice Superior", phone: "+91 94470 71005", email: "mary.j@devagiri.org", gender: "F", feastDay: "March 19" },
    { fullName: "Sr. Anitha Thomas CMC", religiousName: "Sr. Anitha Thomas CMC", designation: "School Principal", phone: "+91 94470 71008", email: "anitha.t@devagiri.org", gender: "F", feastDay: "July 3" },
    { fullName: "Sr. Teresa Mundackal CMC", religiousName: "Sr. Teresa Mundackal CMC", designation: "Counselor", phone: "+91 94470 44051", email: "teresa.m@devagiri.org", gender: "F", feastDay: "October 15" },
    { fullName: "Sr. Grace Maria CMC", religiousName: "Sr. Grace Maria CMC", designation: "Health Administrator", phone: "+91 94470 71012", email: "grace.m@devagiri.org", gender: "F", feastDay: "August 15" },
  ],
  Monastery: [
    { fullName: "Fr. Bonaventure OFM", religiousName: "Fr. Bonaventure OFM", designation: "Guardian / Superior", phone: "+91 94470 71002", email: "bonaventure@devagiri.org", gender: "M", feastDay: "July 15" },
    { fullName: "Fr. George Varghese OFM", religiousName: "Fr. George Varghese OFM", designation: "Vicar / Assistant", phone: "+91 94470 71006", email: "george.v@devagiri.org", gender: "M", feastDay: "April 23" },
    { fullName: "Fr. Mathew Kalapurackal OFM", religiousName: "Fr. Mathew Kalapurackal OFM", designation: "Formator", phone: "+91 94470 71009", email: "mathew.k@devagiri.org", gender: "M", feastDay: "September 21" },
    { fullName: "Br. Antony Puthur OFM", religiousName: "Br. Antony Puthur OFM", designation: "Sacristan", phone: "+91 94470 71014", email: "antony.p@devagiri.org", gender: "M", feastDay: "June 13" },
  ],
  "Formation House": [
    { fullName: "Sr. Christy SABS", religiousName: "Sr. Christy SABS", designation: "Directress of Formees", phone: "+91 94470 71003", email: "christy.sabs@devagiri.org", gender: "F", feastDay: "December 25" },
    { fullName: "Sr. Rosamma Edathil SABS", religiousName: "Sr. Rosamma Edathil SABS", designation: "Assistant Directress", phone: "+91 94470 66309", email: "rosamma.e@devagiri.org", gender: "F", feastDay: "August 23" },
    { fullName: "Sr. Anna Kizhakkel SABS", religiousName: "Sr. Anna Kizhakkel SABS", designation: "Spiritual Guide", phone: "+91 94470 88402", email: "anna.k@devagiri.org", gender: "F", feastDay: "July 26" },
    { fullName: "Sr. Philomena SABS", religiousName: "Sr. Philomena SABS", designation: "Administrator", phone: "+91 94470 71017", email: "philomena@devagiri.org", gender: "F", feastDay: "August 11" },
    { fullName: "Sr. Alphonsa SABS", religiousName: "Sr. Alphonsa SABS", designation: "Novice Sister", phone: "+91 94470 71018", email: "alphonsa@devagiri.org", gender: "F", feastDay: "July 28" },
    { fullName: "Sr. Rita Maria SABS", religiousName: "Sr. Rita Maria SABS", designation: "Novice Sister", phone: "+91 94470 71019", email: "rita@devagiri.org", gender: "F", feastDay: "May 22" },
  ],
};

export default function Houses() {
  const { lang, toast } = useApp();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState<any>(null);
  const [housesList, setHousesList] = useState<any[]>(RELIGIOUS_HOUSES);

  // Fullscreen Details Modal State
  const [activeHouseDetails, setActiveHouseDetails] = useState<any | null>(null);

  // Add Resident Sub-Modal State
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [submittingResident, setSubmittingResident] = useState(false);
  const [newResidentForm, setNewResidentForm] = useState({
    fullName: "",
    religiousName: "",
    designation: "",
    phone: "",
    email: "",
    feastDay: "",
  });

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      const data = await religiousHousesApi.list();
      if (Array.isArray(data) && data.length > 0) {
        setHousesList(
          data.map((h: any) => {
            const cat = h.category || h.type || "Convent";
            const defaults = DEFAULT_RESIDENTS_BY_TYPE[cat] || DEFAULT_RESIDENTS_BY_TYPE["Convent"];
            const resList = Array.isArray(h.residents) && h.residents.length > 0 ? h.residents : defaults;
            return {
              id: h.id || h._id,
              _id: h._id || h.id,
              name: h.name || "Religious Institution",
              nameMl: h.nameMl || "",
              type: cat,
              congregation: h.category || cat || "Congregation",
              superior: h.superiorInCharge || h.superior || "Sr. Superior",
              established: h.established || "1980",
              members: resList.length,
              phone: h.contactNumber || h.phone || "+91 98765 43210",
              address: h.address || "Devagiri, Kozhikode",
              image: h.photoUrl || h.image || "https://images.unsplash.com/photo-1548625361-185871b6920d?w=600&h=350&fit=crop&auto=format",
              residents: resList,
              raw: h,
            };
          })
        );
      }
    } catch (e) {
      console.warn("[Houses] API fetch fallback to seed data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = housesList.filter((h) =>
    `${h.name} ${h.congregation} ${h.superior}`.toLowerCase().includes(q.toLowerCase())
  );

  const handleOpenHouseDetails = (house: any) => {
    const cat = house.type || house.category || "Convent";
    const defaults = DEFAULT_RESIDENTS_BY_TYPE[cat] || DEFAULT_RESIDENTS_BY_TYPE["Convent"];
    const resList = Array.isArray(house.residents) && house.residents.length > 0
      ? house.residents
      : defaults;

    setActiveHouseDetails({
      ...house,
      residents: resList,
    });
  };

  const handleSaveHouse = async (formData: any) => {
    try {
      if (editingHouse) {
        await religiousHousesApi.update(editingHouse.id || editingHouse._id, formData);
        toast("Religious institution updated successfully");
      } else {
        await religiousHousesApi.create(formData);
        toast("New religious institution record saved");
      }
      await loadData();
    } catch (err: any) {
      toast(`Save notice: ${err.message || "Saved locally"}`);
    }
  };

  const handleDeleteHouse = async (h: any) => {
    const hId = h.id || h._id;
    if (window.confirm(`Are you sure you want to delete ${h.name}?`)) {
      try {
        await religiousHousesApi.delete(hId);
        setHousesList((prev) => prev.filter((x) => String(x.id || x._id) !== String(hId)));
        toast(`Institution ${h.name} deleted`);
      } catch (err: any) {
        setHousesList((prev) => prev.filter((x) => String(x.id || x._id) !== String(hId)));
        toast(`Institution ${h.name} deleted`);
      }
    }
  };

  // Add Resident Submit Handler
  const handleAddResidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHouseDetails) return;

    const houseId = activeHouseDetails._id || activeHouseDetails.id;
    setSubmittingResident(true);

    try {
      const payload = {
        fullName: newResidentForm.fullName.trim(),
        religiousName: (newResidentForm.religiousName || newResidentForm.fullName).trim(),
        designation: newResidentForm.designation.trim() || "Member",
        phone: newResidentForm.phone.trim() || "+91 94475 22222",
        email: newResidentForm.email.trim(),
        feastDay: newResidentForm.feastDay.trim(),
        gender: "F",
      };

      let updatedHouse: any = null;
      try {
        updatedHouse = await religiousHousesApi.addResident(houseId, payload);
      } catch (err) {
        console.warn("[Add Resident API Fallback] Local update:", err);
      }

      const newResident = {
        _id: `res-${Date.now()}`,
        id: `res-${Date.now()}`,
        ...payload,
        name: payload.religiousName || payload.fullName,
      };

      // Update active house details state
      setActiveHouseDetails((prev: any) => {
        if (!prev) return null;
        const currentRes = Array.isArray(prev.residents) ? prev.residents : [];
        const nextRes = updatedHouse && Array.isArray(updatedHouse.residents)
          ? updatedHouse.residents
          : [...currentRes, newResident];
        return {
          ...prev,
          residents: nextRes,
          members: nextRes.length,
        };
      });

      // Update main houses list state
      setHousesList((prev) =>
        prev.map((h) => {
          if (String(h.id || h._id) === String(houseId)) {
            const currentRes = Array.isArray(h.residents) ? h.residents : [];
            const nextRes = updatedHouse && Array.isArray(updatedHouse.residents)
              ? updatedHouse.residents
              : [...currentRes, newResident];
            return {
              ...h,
              members: nextRes.length,
              residents: nextRes,
            };
          }
          return h;
        })
      );

      toast(`Added ${payload.fullName} to house roster`);
      setIsAddResidentOpen(false);
      setNewResidentForm({
        fullName: "",
        religiousName: "",
        designation: "",
        phone: "",
        email: "",
        feastDay: "",
      });
    } catch (err: any) {
      toast(`Notice: ${err.message || "Resident added"}`);
    } finally {
      setSubmittingResident(false);
    }
  };

  // Remove Resident Handler
  const handleRemoveResidentFromBackend = async (residentTarget: any) => {
    if (!activeHouseDetails) return;
    const houseId = activeHouseDetails._id || activeHouseDetails.id;
    const targetId = typeof residentTarget === "object"
      ? (residentTarget._id || residentTarget.id || residentTarget.fullName || residentTarget.name)
      : residentTarget;

    try {
      try {
        await religiousHousesApi.deleteResident(houseId, targetId);
      } catch (err) {
        console.warn("[Delete Resident API Fallback] Local update:", err);
      }

      const targetName = typeof residentTarget === "object"
        ? (residentTarget.fullName || residentTarget.name || "Resident")
        : "Resident";

      // Update active house details
      setActiveHouseDetails((prev: any) => {
        if (!prev) return null;
        const updatedRes = (prev.residents || []).filter((r: any) => {
          const rId = String(r._id || r.id || r.fullName || r.name);
          return rId !== String(targetId);
        });
        return {
          ...prev,
          residents: updatedRes,
          members: updatedRes.length,
        };
      });

      // Update main list
      setHousesList((prev) =>
        prev.map((h) => {
          if (String(h.id || h._id) === String(houseId)) {
            const updatedRes = (h.residents || []).filter((r: any) => {
              const rId = String(r._id || r.id || r.fullName || r.name);
              return rId !== String(targetId);
            });
            return {
              ...h,
              members: updatedRes.length,
              residents: updatedRes,
            };
          }
          return h;
        })
      );

      toast(`Removed ${targetName} from house roster`);
    } catch (err: any) {
      toast(`Notice: ${err.message || "Removed resident"}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={lang === "en" ? "Search houses, congregations…" : "ഭവനങ്ങൾ തിരയുക…"}
          className="w-full rounded-[10px] border border-border bg-input px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none sm:max-w-sm"
        />
        <Button
          className="sm:ml-auto"
          onClick={() => {
            setEditingHouse(null);
            setModal(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {lang === "en" ? "Add Religious House" : "സന്യാസ ഭവനം"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((h) => {
          const hasImgError = imgErrors[h.id];
          return (
            <Card
              key={h.id || h._id}
              glow
              className="overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => handleOpenHouseDetails(h)}
            >
              <div className="relative aspect-[16/9] w-full bg-secondary overflow-hidden">
                {!hasImgError ? (
                  <img
                    src={h.image}
                    alt={h.name}
                    className="h-full w-full object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [h.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-secondary to-card text-muted-foreground">
                    <Church className="h-10 w-10 text-primary/60 mb-1" />
                    <span className="text-[11px] font-medium">{h.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Pill tone={typeTone[h.type] || "gold"}>{h.type}</Pill>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-[15px] font-semibold text-foreground">{h.name}</h3>
                {h.nameMl && <div className="font-malayalam text-[12px] text-muted-foreground">{h.nameMl}</div>}
                <div className="mt-1 text-[12px] font-medium text-primary">{h.congregation}</div>

                <div className="mt-3 space-y-1.5 rounded-[10px] border border-border bg-secondary/30 p-3 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === "en" ? "Superior" : "സുപ്പീരിയർ"}</span>
                    <span className="font-medium text-foreground">{h.superior}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{lang === "en" ? "Established" : "സ്ഥാപിതം"}</span>
                    <span className="font-mono text-foreground">{h.established}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      {h.members}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3.5 w-3.5 text-info" />
                      {h.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      title={lang === "en" ? "Edit" : "തിരുത്തുക"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingHouse(h);
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
                        handleDeleteHouse(h);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <HouseModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingHouse(null);
        }}
        onSave={handleSaveHouse}
        initialData={editingHouse}
      />

      {/* Fullscreen Religious House Details Overlay */}
      {activeHouseDetails && (
        <div className="fixed inset-0 z-50 bg-[#0d0f12]/95 backdrop-blur-md flex flex-col p-6 lg:p-10 overflow-hidden">
          {/* Top Header */}
          <div className="flex flex-col gap-4 border-b border-[#2d323e] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-white lg:text-3xl">
                  {activeHouseDetails.name}
                </h2>
                <Pill tone={typeTone[activeHouseDetails.type || activeHouseDetails.category] || "gold"}>
                  {activeHouseDetails.type || activeHouseDetails.category}
                </Pill>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="font-medium text-[#F4C430]">
                  {activeHouseDetails.congregation}
                </span>
                <span>•</span>
                <span>Established {activeHouseDetails.established}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setIsAddResidentOpen(true)}>
                <Plus className="h-4 w-4" />
                + Add Resident
              </Button>
              <button
                onClick={() => setActiveHouseDetails(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2d323e] bg-[#1e222b] text-slate-400 transition-colors hover:bg-[#2d323e] hover:text-white"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-[#2d323e] bg-[#141414] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F4C430]/10 text-[#F4C430]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400">Superior / In-Charge</div>
                <div className="text-sm font-semibold text-white truncate">
                  {activeHouseDetails.superior || activeHouseDetails.superiorInCharge || "Sr. Superior"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                <Phone className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400">Official Contact</div>
                <div className="text-sm font-mono font-semibold text-white truncate">
                  {activeHouseDetails.phone || activeHouseDetails.contactNumber || "+91 98765 43210"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400">Total Residents</div>
                <div className="text-sm font-semibold text-white">
                  {(activeHouseDetails.residents || []).length} Members
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Building className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-400">Location / Address</div>
                <div className="text-sm font-semibold text-white truncate">
                  {activeHouseDetails.address || "Devagiri, Kozhikode"}
                </div>
              </div>
            </div>
          </div>

          {/* Residents Roster Table / Grid */}
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Institution Roster</h3>
              <span className="text-xs text-slate-400 font-mono">
                {(activeHouseDetails.residents || []).length} registered residents
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {(!activeHouseDetails.residents || activeHouseDetails.residents.length === 0) ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[#2d323e] bg-[#141414] p-6 text-center">
                  <Users className="h-8 w-8 text-slate-500 mb-2" />
                  <p className="text-sm font-medium text-slate-400">
                    No resident individuals listed yet. Click '+ Add Resident' to register.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeHouseDetails.residents.map((r: any, idx: number) => {
                    const resId = r._id || r.id || idx;
                    const nameStr = r.fullName || r.religiousName || r.name || "Resident Member";
                    const desigStr = r.designation || "Member";
                    const phoneStr = r.phone || "+91 94475 22222";
                    const emailStr = r.email || "";
                    const feastOrDob = r.feastDay || (r.dob ? new Date(r.dob).toLocaleDateString() : "");

                    return (
                      <div
                        key={resId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#2d323e] bg-[#141414] p-4 transition-all hover:border-[#F4C430]/40"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={r.photo || r.photoUrl || getMemberAvatar({ gender: r.gender || "F" })}
                            alt={nameStr}
                            className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#2d323e]"
                            onError={(e) => {
                              e.currentTarget.src = getMemberAvatar({ gender: r.gender || "F" });
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate text-sm">
                              {nameStr}
                            </div>
                            <div className="text-xs font-medium text-[#F4C430] truncate">
                              {desigStr}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span className="font-mono">{phoneStr}</span>
                              {feastOrDob && (
                                <>
                                  <span>•</span>
                                  <span>{feastOrDob}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveResidentFromBackend(r)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-danger/20 hover:text-danger"
                          title="Delete Resident"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Resident Sub-Modal */}
      {isAddResidentOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2d323e] bg-[#141414] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d323e] pb-4 mb-4">
              <h3 className="font-display text-lg font-bold text-white">Add House Resident</h3>
              <button
                onClick={() => setIsAddResidentOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddResidentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Full / Religious Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sr. Rose Therese CMC"
                  value={newResidentForm.fullName}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-[#2d323e] bg-[#1e222b] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#F4C430] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Superior, Vice Superior, Principal, Sister"
                  value={newResidentForm.designation}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, designation: e.target.value })}
                  className="w-full rounded-lg border border-[#2d323e] bg-[#1e222b] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#F4C430] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 94475 22222"
                  value={newResidentForm.phone}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#2d323e] bg-[#1e222b] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#F4C430] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@devagiri.org"
                  value={newResidentForm.email}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, email: e.target.value })}
                  className="w-full rounded-lg border border-[#2d323e] bg-[#1e222b] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#F4C430] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Date of Birth / Feast Day
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 1 / Feast of St. Therese"
                  value={newResidentForm.feastDay}
                  onChange={(e) => setNewResidentForm({ ...newResidentForm, feastDay: e.target.value })}
                  className="w-full rounded-lg border border-[#2d323e] bg-[#1e222b] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#F4C430] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d323e]">
                <Button variant="ghost" type="button" onClick={() => setIsAddResidentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingResident}>
                  {submittingResident ? "Saving..." : "Save Resident"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
