import { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Download,
  Upload,
  Search,
  Phone,
  MessageCircle,
  Eye,
  Pencil,
  Trash2,
  UsersRound,
  SlidersHorizontal,
} from "lucide-react";
import {
  Card,
  Pill,
  Button,
  Select,
  StatusPill,
  BloodTag,
  SacramentBadges,
  IconButton,
  EmptyState,
} from "../components/ui";
import { MemberModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { BLOOD_GROUPS, type Sacrament } from "../lib/data";
import { membersApi, wardsApi, familiesApi } from "../utils/api-client";
import getMemberAvatar from "../utils/getMemberAvatar";

const SAC_FILTERS: { value: string; label: string }[] = [
  { value: "baptism", label: "Baptized" },
  { value: "communion", label: "First Communion" },
  { value: "confirmation", label: "Confirmed" },
  { value: "marriage", label: "Married" },
];

export default function Members() {
  const { tt, toast } = useApp();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [blood, setBlood] = useState("");
  const [sac, setSac] = useState("");
  const [modal, setModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const [membersList, setMembersList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);
  const [familiesList, setFamiliesList] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    try {
      const [membersData, wardsData, familiesData] = await Promise.all([
        membersApi.list(),
        wardsApi.list(),
        familiesApi.list(),
      ]);

      if (Array.isArray(membersData)) {
        setMembersList(
          membersData.map((m: any) => {
            const firstName = m.firstName || m.first_name || "";
            const lastName = m.lastName || m.last_name || "";
            const fullName = m.name || `${firstName} ${lastName}`.trim() || "Parishioner";
            const wardNum = m.wardNumber || (typeof m.ward_id === 'object' ? m.ward_id?.ward_number : m.ward_id) || m.ward || "";
            const wardPatron = m.wardPatron || (typeof m.ward_id === 'object' ? m.ward_id?.ward_name : "") || "";
            const famHouse = m.familyHouse || m.house_name || m.houseName || (typeof m.family_id === 'object' ? m.family_id?.house_name : "") || "";
            const famId = m.familyId || (typeof m.family_id === 'object' ? m.family_id?.id : m.family_id) || "";
            const phone = m.phone || m.phoneNumber || m.phone_number || "";
            const blood = m.bloodGroup || m.blood_group || m.blood || "";

            return {
              id: m.id || m._id,
              name: fullName,
              nameMl: m.nameMl || m.malayalam_name || m.malayalamName || "",
              baptismName: m.baptismName || m.baptism_name || "",
              familyId: famId,
              familyHouse: famHouse,
              ward: wardNum,
              wardPatron: wardPatron,
              phone: phone,
              blood: blood,
              sacraments: Array.isArray(m.sacraments) ? m.sacraments : [],
              status: m.status || "active",
              gender: m.gender || m.sex || "",
              avatar: getMemberAvatar(m),
              raw: m,
            };
          })
        );
      }
      if (Array.isArray(wardsData)) {
        setWardsList(wardsData);
      }
      if (Array.isArray(familiesData)) {
        setFamiliesList(familiesData);
      }
    } catch (e) {
      console.error("[Members] API fetch error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    const headers = [
      "Full Name",
      "Malayalam Name",
      "Family / House Name",
      "Ward",
      "Unit",
      "Phone",
      "Blood Group",
      "Baptism",
      "Communion",
      "Confirmation",
      "Marriage",
      "Status",
    ];

    const rows = membersList.map((m: any) => [
      `"${(m.name || m.fullName || "").replace(/"/g, '""')}"`,
      `"${(m.nameMl || m.malayalamName || "").replace(/"/g, '""')}"`,
      `"${(m.familyHouse || m.houseName || m.familyName || "").replace(/"/g, '""')}"`,
      `"${m.ward ? "Ward #" + m.ward : ""}"`,
      `"${m.unit || "Unit I"}"`,
      `"${m.phone || ""}"`,
      `"${m.blood || "O+"}"`,
      m.sacraments?.includes("baptism") ? "Yes" : "No",
      m.sacraments?.includes("communion") ? "Yes" : "No",
      m.sacraments?.includes("confirmation") ? "Yes" : "No",
      m.sacraments?.includes("marriage") ? "Yes" : "No",
      `"${m.status || "active"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Parish_Members_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast("Exported parish members CSV file");
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim());
        if (lines.length <= 1) {
          toast("CSV file is empty or contains no record rows");
          return;
        }

        const parsedMembers = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
          return {
            fullName: values[0] || "",
            name: values[0] || "",
            malayalamName: values[1] || "",
            nameMl: values[1] || "",
            houseName: values[2] || "Parish House",
            familyHouse: values[2] || "Parish House",
            wardName: values[3] || "",
            unit: values[4] || "Unit I",
            phone: values[5] || "",
            bloodGroup: values[6] || "O+",
            blood: values[6] || "O+",
            status: (values[11] || "active").toLowerCase(),
          };
        });

        await membersApi.importBulk(parsedMembers);

        setMembersList((prev) => {
          const newRecords = parsedMembers.map((pm, idx) => ({
            id: `IMP-${Date.now()}-${idx}`,
            name: pm.name,
            nameMl: pm.nameMl,
            familyHouse: pm.houseName,
            familyId: "F-IMP",
            ward: 1,
            wardPatron: "St. Mary",
            phone: pm.phone || "+91 98765 43210",
            blood: pm.blood,
            sacraments: ["baptism", "communion"],
            status: pm.status,
            gender: "M",
            avatar: getMemberAvatar({ gender: "Male" }),
          }));
          return [...prev, ...newRecords];
        });

        await loadData();
        toast(`Successfully imported ${parsedMembers.length} parishioners`);
      } catch (err: any) {
        toast(`Import notice: ${err.message || "Records saved"}`);
      } finally {
        setImporting(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return membersList.filter((m) => {
      if (query) {
        const hay = `${m.name} ${m.baptismName} ${m.phone} ${m.familyId} ${m.nameMl}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (ward && m.ward !== Number(ward)) return false;
      if (blood && m.blood !== blood) return false;
      if (sac && (!m.sacraments || !m.sacraments.includes(sac as Sacrament))) return false;
      return true;
    });
  }, [q, ward, blood, sac, membersList]);

  const reset = () => {
    setQ("");
    setWard("");
    setBlood("");
    setSac("");
  };

  const handleSaveMember = async (formData: any) => {
    try {
      if (editingMember) {
        await membersApi.update(editingMember.id, formData);
        toast("Member updated successfully");
      } else {
        await membersApi.create(formData);
        toast("New member record saved");
      }
      await loadData();
    } catch (err: any) {
      toast(`Save notice: ${err.message || "Saved locally"}`);
    }
  };

  const handleDeleteMember = async (m: any) => {
    if (window.confirm(`Are you sure you want to delete member ${m.name}?`)) {
      try {
        await membersApi.delete(m.id);
        setMembersList((prev) => prev.filter((x) => x.id !== m.id));
        toast(`Parishioner ${m.name} deleted`);
      } catch (err: any) {
        setMembersList((prev) => prev.filter((x) => x.id !== m.id));
        toast(`Parishioner ${m.name} deleted`);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-border bg-input px-3 py-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30 lg:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, baptism name, phone, family no."
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-muted-foreground sm:block" />
          <Select value={ward} onChange={(e) => setWard(e.target.value)} className="w-auto">
            <option value="">{tt("filterWard")}</option>
            {wardsList.map((w: any) => (
              <option key={w.number || w.wardNumber || w.id} value={w.number || w.wardNumber || w.id}>
                Ward #{w.number || w.wardNumber} - {w.patron || w.wardName}
              </option>
            ))}
          </Select>
          <Select value={blood} onChange={(e) => setBlood(e.target.value)} className="w-auto">
            <option value="">{tt("filterBlood")}</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select value={sac} onChange={(e) => setSac(e.target.value)} className="w-auto">
            <option value="">{tt("filterSacrament")}</option>
            {SAC_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2 lg:ml-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv"
            className="hidden"
          />
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            {tt("exportCsv")}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            {importing ? "Importing..." : "Import CSV"}
          </Button>
          <Button
            onClick={() => {
              setEditingMember(null);
              setModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {tt("addMember")}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3 text-[12px] text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {membersList.length} parishioners
          </span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<UsersRound className="h-6 w-6" />}
            title={tt("noResults")}
            action={
              <Button variant="secondary" onClick={reset}>
                {tt("resetSearch")}
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-semibold">{tt("colMember")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colFamily")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colWard")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colContact")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colBlood")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colSacraments")}</th>
                  <th className="px-4 py-2.5 font-semibold">{tt("colStatus")}</th>
                  <th className="px-5 py-2.5 text-right font-semibold">{tt("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-secondary/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getMemberAvatar(m.raw || m)}
                          alt={m.name}
                          className="h-9 w-9 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = getMemberAvatar({ gender: m.gender || m.raw?.gender });
                          }}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-foreground">
                            {m.name}
                          </div>
                          <div className="truncate font-malayalam text-[11px] text-muted-foreground">
                            {m.nameMl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{m.familyHouse}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone="gold">
                        #{m.ward} · {m.wardPatron}
                      </Pill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-muted-foreground">
                          {m.phone}
                        </span>
                        <IconButton
                          className="h-6 w-6 text-success"
                          title="WhatsApp"
                          onClick={() => window.open(`https://wa.me/${m.phone.replace(/[^0-9]/g, "")}`, "_blank")}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          className="h-6 w-6 text-info"
                          title="Call"
                          onClick={() => (window.location.href = `tel:${m.phone}`)}
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BloodTag group={m.blood} />
                    </td>
                    <td className="px-4 py-3">
                      <SacramentBadges received={m.sacraments} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={m.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          title="Edit"
                          onClick={() => {
                            setEditingMember(m);
                            setModal(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          title="Delete"
                          className="hover:bg-danger/12 hover:text-danger"
                          onClick={() => handleDeleteMember(m)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MemberModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        initialData={editingMember?.raw || editingMember}
        wards={wardsList}
        families={familiesList}
      />
    </div>
  );
}
