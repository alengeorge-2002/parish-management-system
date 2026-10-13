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
import { MINISTRIES, type Ministry } from "../lib/data";
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

const SAMPLE_MINISTRY_ROSTERS: Record<string, RosterItem[]> = {
  "Altar Servers Guild": [
    { name: "Dn. Alex Karimban", designation: "Spiritual Director", phone: "+91 94470 72001", email: "alex.k@devagiri.org", gender: "M" },
    { name: "Alan Joseph", designation: "President", phone: "+91 98470 11001", email: "alan.j@devagiri.org", gender: "M" },
    { name: "Kevin Thomas", designation: "Secretary", phone: "+91 98470 11002", email: "kevin.t@devagiri.org", gender: "M" },
    { name: "Emmanuel George", designation: "Master of Ceremonies", phone: "+91 98470 11003", gender: "M" },
    { name: "Leo Varghese", designation: "Senior Server", phone: "+91 98470 11004", gender: "M" },
    { name: "Justin Paul", designation: "Altar Server", phone: "+91 98470 11005", gender: "M" },
  ],
  "Parish Choir": [
    { name: "Mr. Jocy Fernandez", designation: "Choir Master", phone: "+91 94470 72002", email: "jocy.f@devagiri.org", gender: "M" },
    { name: "Marykutty Joseph", designation: "Organist", phone: "+91 98470 22001", gender: "F" },
    { name: "Antony Puthur", designation: "Tenor Lead", phone: "+91 94470 11202", gender: "M" },
    { name: "Rose Augustin", designation: "Soprano Lead", phone: "+91 98470 22003", gender: "F" },
    { name: "Joseph Chelakkal", designation: "Bass Lead", phone: "+91 98470 22004", gender: "M" },
  ],
  "Kerala Catholic Youth Movement": [
    { name: "Mr. Nithin Joseph", designation: "President", phone: "+91 94470 72003", email: "nithin.kcym@devagiri.org", gender: "M" },
    { name: "Mary Vadakkel", designation: "Vice President", phone: "+91 94470 11206", gender: "F" },
    { name: "Antony Kochupurackal", designation: "General Secretary", phone: "+91 98470 33212", gender: "M" },
    { name: "Joychan Kavalam", designation: "Treasurer", phone: "+91 94470 11201", gender: "M" },
    { name: "Anish Varghese", designation: "Joint Secretary", phone: "+91 98470 33215", gender: "M" },
  ],
  "St. Vincent de Paul Society": [
    { name: "Mrs. Gracy Thundiyil", designation: "President", phone: "+91 94470 72004", email: "gracy.svp@devagiri.org", gender: "F" },
    { name: "Thomas Chelakkal", designation: "Vice President", phone: "+91 94470 11204", gender: "M" },
    { name: "Rosamma Edathil", designation: "Secretary", phone: "+91 98470 66309", gender: "F" },
    { name: "Kurian Manjaly", designation: "Treasurer", phone: "+91 98470 77177", gender: "M" },
    { name: "Joseph Thekkedathu", designation: "Active Member", phone: "+91 98470 22108", gender: "M" },
  ],
  "Sunday Catechism": [
    { name: "Sr. Little Rose CMC", designation: "Headmistress", phone: "+91 94470 72005", email: "rose.catechism@devagiri.org", gender: "F" },
    { name: "Sr. Anitha Thomas", designation: "Class XI Coordinator", phone: "+91 94470 71008", gender: "F" },
    { name: "Mary Jose", designation: "Class X Teacher", phone: "+91 98470 55001", gender: "F" },
    { name: "Antony Puthur", designation: "Class IX Teacher", phone: "+91 94470 11202", gender: "M" },
    { name: "Teresa Mundackal", designation: "Class VIII Teacher", phone: "+91 98470 44051", gender: "F" },
  ],
  "Legion of Mary": [
    { name: "Mrs. Anna Kizhakkel", designation: "President", phone: "+91 94470 72006", email: "anna.legion@devagiri.org", gender: "F" },
    { name: "Mariamma Thekkedathu", designation: "Vice President", phone: "+91 98470 22109", gender: "F" },
    { name: "Rosamma Edathil", designation: "Secretary", phone: "+91 98470 66309", gender: "F" },
    { name: "Sr. Teresa Mundackal", designation: "Spiritual Director", phone: "+91 98470 44051", gender: "F" },
  ],
  "Charismatic Prayer Group": [
    { name: "Mr. Paulose Karottu", designation: "Group Leader", phone: "+91 94470 72007", email: "paulose.praise@devagiri.org", gender: "M" },
    { name: "Simon Poovathur", designation: "Co-Leader", phone: "+91 94470 11213", gender: "M" },
    { name: "Elias Thundiyil", designation: "Music Leader", phone: "+91 94470 11212", gender: "M" },
    { name: "Mary Vadakkel", designation: "Intercessor", phone: "+91 94470 11206", gender: "F" },
  ],
  "Mother's Forum (Matru Vedi)": [
    { name: "Mrs. Rosamma Edathil", designation: "President", phone: "+91 94470 72008", email: "rosamma.matru@devagiri.org", gender: "F" },
    { name: "Anna Kizhakkel", designation: "Vice President", phone: "+91 98470 88402", gender: "F" },
    { name: "Mariamma Thekkedathu", designation: "Secretary", phone: "+91 98470 22109", gender: "F" },
    { name: "Gracy Thundiyil", designation: "Treasurer", phone: "+91 94470 72004", gender: "F" },
  ],
};

export default function Ministries() {
  const { lang, toast } = useApp();
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [ministriesList, setMinistriesList] = useState<any[]>(MINISTRIES);

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

      if (Array.isArray(data) && data.length > 0) {
        setMinistriesList(
          data.map((m: any) => ({
            id: m.id || m._id,
            name: m.title || m.name_en || m.name || "Ministry",
            nameMl: m.nameMl || m.name_ml || "",
            coordinator: m.coordinator || "Coordinator",
            phone: m.phone || m.phone_number || "+91 94470 72000",
            members: m.member_count || (m.members ? m.members.length : 20),
            category: m.category || "Liturgical",
            meets: m.meets || m.meeting_time || "Weekly",
            rawMembers: m.members || [],
            raw: m,
          }))
        );
      }

      if (Array.isArray(membersData) && membersData.length > 0) {
        setParishionersList(
          membersData.map((m: any) => ({
            id: m.id || m._id,
            name: m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Parishioner",
            nameMl: m.nameMl || m.malayalamName || "",
            phone: m.phone || m.phoneNumber || "+91 98765 43210",
            ward: m.wardNumber || m.ward || 1,
            unit: m.unit || m.unit_number || "Unit I",
            familyHouse: m.familyHouse || m.houseName || "Parish House",
            avatar: getMemberAvatar(m.raw || m),
            raw: m,
          }))
        );
      }
    } catch (e) {
      console.warn("[Ministries] API fetch fallback to seed data:", e);
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
        phone: mem.phone_number || mem.phone || "+91 98765 43210",
        email: mem.email || "",
      }));
    } else {
      members = SAMPLE_MINISTRY_ROSTERS[ministry.name] || [
        { name: ministry.coordinator || "Coordinator", designation: "Coordinator", phone: ministry.phone, gender: "M" },
        { name: "Joychan Kavalam", designation: "Secretary", phone: "+91 94470 11201", gender: "M" },
        { name: "Mary Vadakkel", designation: "Treasurer", phone: "+91 94470 11206", gender: "F" },
        { name: "Antony Puthur", designation: "Member", phone: "+91 94470 11202", gender: "M" },
      ];
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
          <Button onClick={() => toast(lang === "en" ? "Ministry form opened" : "ഫോം തുറന്നു")}>
            <Plus className="h-4 w-4" />
            {lang === "en" ? "Add Ministry" : "സേവനം ചേർക്കുക"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => {
          const Icon = catIcon[m.category] || Church;
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
                <Pill tone={catTone[m.category] || "gold"}>{m.category}</Pill>
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {m.meets}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[12px]">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    {lang === "en" ? "Coordinator" : "ഏകോപകൻ"}
                  </div>
                  <div className="font-medium text-foreground">{m.coordinator}</div>
                </div>
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
              </div>
            </Card>
          );
        })}
      </div>

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
    </div>
  );
}

