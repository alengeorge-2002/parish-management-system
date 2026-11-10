import { useState, useEffect } from "react";
import {
  Plus,
  Phone,
  Users,
  CalendarClock,
  Music,
  Sparkles,
  HandHeart,
  BookOpen,
  Church,
  Pencil,
  Trash2,
  Search,
  Check,
} from "lucide-react";
import { Card, Pill, Button, IconButton, Modal, Field, Input, Select } from "../components/ui";
import { RosterDrawer, type RosterItem } from "../components/RosterDrawer";
import { useApp } from "../lib/app-context";
import { type Ministry } from "../lib/data";
import { ministriesApi, membersApi } from "../utils/api-client";
import getMemberAvatar from "../utils/getMemberAvatar";

const catTone: Record<Ministry["category"], "gold" | "blue" | "green" | "violet" | "neutral"> = {
  Liturgical: "gold",
  Youth: "blue",
  Charity: "green",
  Catechetical: "violet",
  Devotional: "neutral",
};

const catIcon: Record<Ministry["category"], typeof Music> = {
  Liturgical: Music,
  Youth: Sparkles,
  Charity: HandHeart,
  Catechetical: BookOpen,
  Devotional: Church,
};

const CATS = ["All", "Liturgical", "Youth", "Charity", "Catechetical", "Devotional"] as const;

export default function Ministries() {
  const { lang, toast } = useApp();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [ministriesList, setMinistriesList] = useState<any[]>([]);

  // Add Ministry Modal States
  const [isAddMinistryModalOpen, setIsAddMinistryModalOpen] = useState(false);
  const [savingMinistry, setSavingMinistry] = useState(false);
  const [ministryError, setMinistryError] = useState("");
  const [ministryForm, setMinistryForm] = useState({
    name: "",
    category: "Liturgical" as Ministry["category"],
    coordinator: "",
    phone: "",
    meets: "",
  });

  // Roster Drawer States
  const [selectedMinistryForDetails, setSelectedMinistryForDetails] = useState<any | null>(null);
  const [ministryMembers, setMinistryMembers] = useState<RosterItem[]>([]);

  // Add Member Modal States
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [parishionerSearchQuery, setParishionerSearchQuery] = useState("");
  const [selectedParishioner, setSelectedParishioner] = useState<any>(null);
  const [ministryRole, setMinistryRole] = useState("Active Member");
  const [parishionersList, setParishionersList] = useState<any[]>([]);
  const [savingMember, setSavingMember] = useState(false);

  const loadData = async () => {
    try {
      const [data, membersData] = await Promise.all([
        ministriesApi.list().catch(() => []),
        membersApi.list().catch(() => []),
      ]);

      if (Array.isArray(data)) {
        setMinistriesList(
          data.map((m: any) => ({
            id: m.id || m._id,
            name: m.title || m.name_en || m.name || "Ministry",
            nameMl: m.nameMl || m.name_ml || "",
            coordinator: m.coordinator || "Coordinator",
            phone: m.phone || m.phone_number || "",
            members: m.member_count || (m.members ? m.members.length : 0),
            category: m.category || "Liturgical",
            meets: m.meets || m.meeting_time || m.description || "",
            rawMembers: m.members || [],
            raw: m,
          }))
        );
      }

      if (Array.isArray(membersData)) {
        setParishionersList(
          membersData.map((m: any) => ({
            id: m.id || m._id,
            name: m.name || `${m.firstName || m.first_name || ""} ${m.lastName || m.last_name || ""}`.trim() || "Parishioner",
            nameMl: m.nameMl || m.malayalam_name || m.malayalamName || "",
            phone: m.phone || m.phoneNumber || m.phone_number || "",
            ward: m.wardNumber || (typeof m.ward_id === "object" ? m.ward_id?.ward_number : m.ward_id) || m.ward || 1,
            unit: m.unit || m.unit_number || "",
            familyHouse: m.familyHouse || m.house_name || m.houseName || "",
            avatar: getMemberAvatar(m.raw || m),
            raw: m,
          }))
        );
      }
    } catch (e) {
      console.error("[Ministries] API fetch error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = ministriesList.filter((m) => cat === "All" || m.category === cat);
  const totalMembers = ministriesList.reduce((s, m) => s + (m.members || 0), 0);

  const filteredParishioners = parishionersList.filter((p) => {
    if (!parishionerSearchQuery.trim()) return true;
    const q = parishionerSearchQuery.toLowerCase().trim();
    const hay = `${p.name} ${p.nameMl} ${p.phone} ${p.familyHouse} ${p.ward} ${p.unit}`.toLowerCase();
    return hay.includes(q);
  });

  const handleOpenMinistryDetails = (ministry: any) => {
    setSelectedMinistryForDetails(ministry);
    let members: RosterItem[] = [];

    if (ministry.rawMembers && Array.isArray(ministry.rawMembers) && ministry.rawMembers.length > 0) {
      members = ministry.rawMembers.map((mem: any) => ({
        id: mem.assignment_id || mem.member_id || mem._id || mem.id,
        name: mem.fullName || (mem.first_name ? `${mem.first_name} ${mem.last_name || ""}`.trim() : (mem.name || "Member")),
        role: mem.role_title || mem.role || "Member",
        designation: mem.role_title || mem.role || "Member",
        phone: mem.phone_number || mem.phone || "",
        email: mem.email || "",
      }));
    }
    setMinistryMembers(members);
  };

  const handleRemoveMember = async (member: RosterItem) => {
    if (selectedMinistryForDetails && (member.id || member.name)) {
      try {
        await ministriesApi.removeMember(selectedMinistryForDetails.id, member.id || member.name);
      } catch (_) {
        // ignore
      }
    }
    setMinistryMembers((prev) => prev.filter((m) => m.name !== member.name && m.id !== member.id));
    toast(`Removed ${member.name} from ministry roster`);
  };

  const handleAddMemberClick = () => {
    setParishionerSearchQuery("");
    setSelectedParishioner(null);
    setMinistryRole("Active Member");
    setIsAddMemberModalOpen(true);
  };

  const handleAddMemberSubmit = async () => {
    if (!selectedParishioner || !selectedMinistryForDetails) return;
    setSavingMember(true);
    try {
      const mId = selectedMinistryForDetails.id;
      const pId = selectedParishioner.id || selectedParishioner._id;

      await ministriesApi.addMember(mId, pId, ministryRole);

      const newMemberItem: RosterItem = {
        id: pId,
        name: selectedParishioner.name,
        designation: ministryRole,
        role: ministryRole,
        phone: selectedParishioner.phone,
      };

      setMinistryMembers((prev) => [...prev, newMemberItem]);
      toast(`Added ${selectedParishioner.name} to ${selectedMinistryForDetails.name}`);
      setIsAddMemberModalOpen(false);
      await loadData();
    } catch (err: any) {
      // Local fallback
      const newMemberItem: RosterItem = {
        id: selectedParishioner.id,
        name: selectedParishioner.name,
        designation: ministryRole,
        role: ministryRole,
        phone: selectedParishioner.phone,
      };
      setMinistryMembers((prev) => [...prev, newMemberItem]);
      toast(`Added ${selectedParishioner.name} to roster`);
      setIsAddMemberModalOpen(false);
    } finally {
      setSavingMember(false);
    }
  };

  const handleOpenAddMinistry = () => {
    setMinistryForm({
      name: "",
      category: cat !== "All" ? cat : "Liturgical",
      coordinator: "",
      phone: "",
      meets: "",
    });
    setMinistryError("");
    setIsAddMinistryModalOpen(true);
  };

  const handleCreateMinistrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ministryForm.name.trim()) {
      setMinistryError("Ministry name is required");
      return;
    }
    setMinistryError("");
    setSavingMinistry(true);
    try {
      await ministriesApi.create({
        title: ministryForm.name.trim(),
        name: ministryForm.name.trim(),
        category: ministryForm.category,
        ministry_category: ministryForm.category,
        coordinator: ministryForm.coordinator.trim(),
        phone: ministryForm.phone.trim(),
        meets: ministryForm.meets.trim(),
        meeting_time: ministryForm.meets.trim(),
        description: ministryForm.meets.trim(),
      });
      toast(`Ministry "${ministryForm.name.trim()}" registered`);
      setIsAddMinistryModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to create ministry:", err);
      setMinistryError(err.message || "Failed to create ministry");
      toast(err.message || "Failed to create ministry");
    } finally {
      setSavingMinistry(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                cat === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 lg:ml-auto">
          <span className="text-[12px] text-muted-foreground">
            {lang === "en" ? "Total volunteers" : "മൊത്തം അംഗങ്ങൾ"}:{" "}
            <span className="font-display text-[14px] font-bold text-foreground">
              {totalMembers.toLocaleString()}
            </span>
          </span>
          <Button onClick={handleOpenAddMinistry}>
            <Plus className="h-4 w-4" />
            {lang === "en" ? "Add Ministry" : "സേവനം ചേർക്കുക"}
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center bg-[#181b22] border border-zinc-800 rounded-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4C430]/10 border border-[#F4C430]/20 text-[#F4C430] mb-4">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {ministriesList.length === 0
              ? "No Ministries Registered"
              : `No Ministries in ${cat}`}
          </h3>
          <p className="mt-1.5 max-w-md text-[13px] text-muted-foreground">
            {ministriesList.length === 0
              ? "Click '+ Add Ministry' above to create your parish's first ministry or committee."
              : `No ministries are currently listed under the ${cat} category. Try switching categories or add a new ministry.`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => {
            const Icon = catIcon[m.category as Ministry["category"]] || Church;
            return (
              <Card
                key={m.id}
                glow
                className="p-5 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                onClick={() => handleOpenMinistryDetails(m)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Pill tone={catTone[m.category as Ministry["category"]] || "gold"}>{m.category}</Pill>
                </div>
                <h3 className="mt-3 font-display text-[15px] font-semibold text-foreground">
                  {m.name}
                </h3>
                {m.nameMl && <div className="font-malayalam text-[12px] text-muted-foreground">{m.nameMl}</div>}

                <div className="mt-3 space-y-1.5 text-[12px]">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-foreground">{m.members}</span>{" "}
                    {lang === "en" ? "members" : "അംഗങ്ങൾ"}
                  </div>
                  {m.meets && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{m.meets}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[12px]">
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      {lang === "en" ? "Coordinator" : "ഏകോപകൻ"}
                    </div>
                    <div className="font-medium text-foreground">{m.coordinator || "—"}</div>
                  </div>
                  {m.phone && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`tel:${m.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        title="Call Coordinator"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-info hover:bg-info/12"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Roster Drawer for Selected Ministry */}
      {selectedMinistryForDetails && (
        <RosterDrawer
          open={Boolean(selectedMinistryForDetails)}
          onClose={() => setSelectedMinistryForDetails(null)}
          title={selectedMinistryForDetails.name}
          subtitle={selectedMinistryForDetails.meets}
          category={selectedMinistryForDetails.category}
          leaderLabel={lang === "en" ? "Coordinator" : "ഏകോപകൻ"}
          leaderName={selectedMinistryForDetails.coordinator}
          phone={selectedMinistryForDetails.phone}
          totalCount={selectedMinistryForDetails.members}
          typeText="Active Members"
          roster={ministryMembers}
          onAddMember={handleAddMemberClick}
          onRemoveMember={handleRemoveMember}
        />
      )}

      {/* Custom Searchable Parishioner Selector Modal */}
      <Modal
        open={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Ministry Member"
        subtitle={selectedMinistryForDetails ? selectedMinistryForDetails.name : "Parishioner Selection"}
        wide
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMemberSubmit}
              disabled={!selectedParishioner || savingMember}
            >
              <Check className="h-4 w-4" />
              {savingMember ? "Adding..." : "Add to Ministry"}
            </Button>
          </>
        }
      >
        <div className="space-y-4 font-sans">
          {/* Live Search Input */}
          <Field label="Search Parishioner">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400" />
              <Input
                value={parishionerSearchQuery}
                onChange={(e) => setParishionerSearchQuery(e.target.value)}
                placeholder="Search parishioner by name, phone, or ward..."
                className="pl-9 bg-[#181b22] border-[#2d323e] text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </Field>

          {/* Search Results List */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Registered Member ({filteredParishioners.length} found)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 rounded-lg border border-[#2d323e] bg-[#181b22] p-2">
              {filteredParishioners.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No parishioner found matching "{parishionerSearchQuery}"
                </div>
              ) : (
                filteredParishioners.map((p) => {
                  const isSel = selectedParishioner?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParishioner(p)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSel
                          ? "border-[#F4C430] bg-[#F4C430]/10 text-white"
                          : "border-[#2d323e] bg-[#1e222b] text-slate-300 hover:border-slate-600 hover:bg-[#252a36]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = getMemberAvatar({ gender: "Male" });
                          }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                            {p.name}
                            {p.nameMl && (
                              <span className="font-malayalam text-[11px] font-normal text-slate-400">
                                ({p.nameMl})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.familyHouse} · {p.phone}
                          </div>
                        </div>
                      </div>
                      <Pill tone={isSel ? "gold" : "neutral"} className="text-[10px]">
                        Ward #{p.ward} · {p.unit}
                      </Pill>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Role Input / Select */}
          <Field label="Ministry Role / Responsibility">
            <Select
              value={ministryRole}
              onChange={(e) => setMinistryRole(e.target.value)}
              className="bg-[#181b22] border-[#2d323e] text-slate-200"
            >
              <option value="Active Member">Active Member</option>
              <option value="Altar Leader">Altar Leader</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Youth Coordinator">Youth Coordinator</option>
              <option value="Animator">Animator</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Executive Member">Executive Member</option>
              <option value="Master of Ceremonies">Master of Ceremonies</option>
              <option value="Volunteer">Volunteer</option>
            </Select>
          </Field>
        </div>
      </Modal>

      {/* Add Ministry Modal */}
      {isAddMinistryModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !savingMinistry && setIsAddMinistryModalOpen(false)}
        >
          <div
            className="bg-[#181b22] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {lang === "en" ? "Add Ministry" : "സേവനം ചേർക്കുക"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a new parish ministry, committee, or pious association
                </p>
              </div>
              <button
                type="button"
                onClick={() => !savingMinistry && setIsAddMinistryModalOpen(false)}
                className="text-zinc-400 hover:text-foreground text-sm font-semibold p-1 cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMinistrySubmit} className="mt-4 space-y-4">
              <Field label="Ministry Name *">
                <Input
                  placeholder="e.g. Altar Servers, Youth Choir, St. Vincent de Paul"
                  value={ministryForm.name}
                  onChange={(e) => {
                    setMinistryForm({ ...ministryForm, name: e.target.value });
                    if (ministryError) setMinistryError("");
                  }}
                  autoFocus
                  className="bg-[#141414] border-zinc-800"
                />
              </Field>

              <Field label="Category">
                <Select
                  value={ministryForm.category}
                  onChange={(e) =>
                    setMinistryForm({
                      ...ministryForm,
                      category: e.target.value as Ministry["category"],
                    })
                  }
                  className="bg-[#141414] border-zinc-800"
                >
                  <option value="Liturgical">Liturgical</option>
                  <option value="Youth">Youth</option>
                  <option value="Charity">Charity</option>
                  <option value="Catechetical">Catechetical</option>
                  <option value="Devotional">Devotional</option>
                </Select>
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Coordinator / Lead Name">
                  <Input
                    placeholder="e.g. Thomas Sebastian"
                    value={ministryForm.coordinator}
                    onChange={(e) =>
                      setMinistryForm({ ...ministryForm, coordinator: e.target.value })
                    }
                    className="bg-[#141414] border-zinc-800"
                  />
                </Field>
                <Field label="Phone Number">
                  <Input
                    placeholder="+91 98450 00000"
                    value={ministryForm.phone}
                    onChange={(e) =>
                      setMinistryForm({ ...ministryForm, phone: e.target.value })
                    }
                    className="bg-[#141414] border-zinc-800"
                  />
                </Field>
              </div>

              <Field label="Description / Meeting Schedule">
                <textarea
                  rows={3}
                  placeholder="e.g. Every Sunday at 9:30 AM in Parish Hall"
                  value={ministryForm.meets}
                  onChange={(e) =>
                    setMinistryForm({ ...ministryForm, meets: e.target.value })
                  }
                  className="w-full rounded-[8px] border border-zinc-800 bg-[#141414] px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-[#F4C430]/60 focus:outline-none"
                />
              </Field>

              {ministryError && (
                <p className="text-xs text-rose-400 font-medium">{ministryError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddMinistryModalOpen(false)}
                  disabled={savingMinistry}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingMinistry}>
                  <Check className="h-4 w-4" />
                  {savingMinistry ? "Creating..." : "Create Ministry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

