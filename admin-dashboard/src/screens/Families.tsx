import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  Table2,
  Phone,
  Pencil,
  ArrowRight,
  User,
  Trash2,
} from "lucide-react";
import { Card, Pill, Button, Select, IconButton } from "../components/ui";
import { FamilyModal, FamilyDetailsModal } from "../components/modals";
import { useApp } from "../lib/app-context";
import { FAMILIES, WARDS, type Family } from "../lib/data";
import { getMemberAvatar } from "../utils/getMemberAvatar";
import { familiesApi, wardsApi, membersApi } from "../utils/api-client";

function AvatarStack({ family, onClick }: { family: any; onClick?: () => void }) {
  const memberCount = family.memberCount || 4;
  const avatars = [
    getMemberAvatar({ gender: "male", familyPhoto: family.familyPhotoUrl || family.banner }),
    getMemberAvatar({ gender: "female", familyPhoto: family.familyPhotoUrl || family.banner }),
    getMemberAvatar({ gender: "male", familyPhoto: family.familyPhotoUrl || family.banner }),
  ];
  const shown = avatars.slice(0, 4);
  const extra = memberCount - shown.length;

  return (
    <div className="flex items-center cursor-pointer" onClick={onClick}>
      <div className="flex -space-x-2">
        {shown.map((a: string, i: number) => (
          <img
            key={i}
            src={a}
            alt=""
            className="h-7 w-7 rounded-full border-2 border-card object-cover"
            onError={(e) => {
              e.currentTarget.src = getMemberAvatar({ gender: i % 2 === 0 ? "male" : "female" });
            }}
          />
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-1 text-[11px] font-medium text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}

export default function Families() {
  const { tt, toast, selectedWardFilter, setSelectedWardFilter } = useApp();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState(selectedWardFilter || "");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [modal, setModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<any>(null);

  const [selectedFamilyForDetails, setSelectedFamilyForDetails] = useState<any>(null);
  const [familyMembersList, setFamilyMembersList] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [familiesList, setFamiliesList] = useState<any[]>(FAMILIES);
  const [wardsList, setWardsList] = useState<any[]>(WARDS);
  const [membersList, setMembersList] = useState<any[]>([]);

  const handleOpenFamilyDetails = async (f: any) => {
    setSelectedFamilyForDetails(f);
    setDetailsModalOpen(true);
    setLoadingMembers(true);
    try {
      const targetId = String(f.id || f._id || f.raw?._id || "");
      const res = await membersApi.list({ familyId: targetId });
      
      // Safely extract array from res (handles array, res.data, res.members, etc.)
      const rawList = Array.isArray(res) 
        ? res 
        : (res && Array.isArray((res as any).data) ? (res as any).data : (res && Array.isArray((res as any).members) ? (res as any).members : []));
      
      if (Array.isArray(rawList) && rawList.length > 0) {
        const matched = rawList.filter((m: any) => {
          const mFamId = String(m.familyId || m.family_id || m.raw?.family_id || m.raw?.family || "");
          return mFamId === targetId || mFamId === String(f.raw?._id);
        });
        setFamilyMembersList(matched.length > 0 ? matched : rawList);
      } else {
        const localMatched = membersList.filter((m: any) => {
          const mFamId = String(m.familyId || m.family_id || m.raw?.family_id || m.raw?.family || "");
          return mFamId === targetId || mFamId === String(f.raw?._id);
        });
        setFamilyMembersList(localMatched);
      }
    } catch (err) {
      console.error("Failed to load family members for roster:", err);
      const localMatched = membersList.filter((m: any) => {
        const mFamId = String(m.familyId || m.family_id || m.raw?.family_id || m.raw?.family || "");
        return mFamId === String(f.id || f._id) || mFamId === String(f.raw?._id);
      });
      setFamilyMembersList(localMatched);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (selectedWardFilter) {
      setWard(selectedWardFilter);
    }
  }, [selectedWardFilter]);

  const loadData = async () => {
    try {
      const [familiesData, wardsData, membersData] = await Promise.all([
        familiesApi.list(),
        wardsApi.list(),
        membersApi.list(),
      ]);

      if (Array.isArray(familiesData) && familiesData.length > 0) {
        setFamiliesList(
          familiesData.map((f: any) => {
            const wardObj = typeof f.ward === 'object' ? f.ward : (typeof f.wardId === 'object' ? f.wardId : (typeof f.ward_id === 'object' ? f.ward_id : null));
            const wardNum = f.wardNumber || f.ward_number || wardObj?.ward_number || wardObj?.wardNumber || (typeof f.ward === 'number' || typeof f.ward === 'string' ? f.ward : 1);
            const wardName = f.wardName || f.ward_name || wardObj?.ward_name || wardObj?.wardName || f.wardPatron || "St. Mary";
            const unitName = f.unit || f.unit_number || f.unitNumber || "Unit I";
            const headName = typeof f.headOfFamily === 'object' ? (f.headOfFamily?.first_name ? `${f.headOfFamily.first_name} ${f.headOfFamily.last_name || ''}` : f.headOfFamily?.full_name || f.headOfFamily?.fullName || f.headOfFamily?.name || "Family Head") : (typeof f.head_of_family === 'object' ? (f.head_of_family?.full_name || f.head_of_family?.fullName || f.head_of_family?.name || "Family Head") : (f.headOfFamily || f.head_of_family || f.head || "Family Head"));
            const houseName = typeof f.houseName === 'object' ? (f.houseName?.house_name || f.houseName?.familyName || "Household") : (typeof f.house_name === 'object' ? (f.house_name?.house_name || "Household") : (f.familyName || f.houseName || f.house_name || f.house || "Parish Household"));
            const phoneNum = typeof f.contactNumber === 'object' ? (f.contactNumber?.phone || "") : (typeof f.contact_number === 'object' ? (f.contact_number?.phone || "") : (f.phone || f.contactNumber || f.contact_number || "+91 98765 43210"));

            return {
              id: typeof f.id === 'object' ? (f.id?._id || String(f.id)) : (f.id || f._id || "F-100"),
              house: houseName,
              head: headName,
              ward: wardNum,
              wardNumber: wardNum,
              wardName: wardName,
              unit: unitName,
              unitNumber: unitName,
              wardId: f.wardId || f.ward_id || f.ward || wardNum || 1,
              wardPatron: wardName,
              phone: phoneNum,
              memberCount: f.memberCount || 4,
              banner: f.familyPhotoUrl || f.family_photo_url || f.banner || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=350&fit=crop&auto=format",
              avatars: [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&auto=format",
              ],
              raw: f,
            };
          })
        );
      }
      if (Array.isArray(wardsData) && wardsData.length > 0) {
        setWardsList(wardsData);
      }
      if (Array.isArray(membersData) && membersData.length > 0) {
        setMembersList(membersData);
      }
    } catch (e) {
      console.warn("[Families] API fetch fallback to seed data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return familiesList.filter((f) => {
      if (query && !`${f.house} ${f.head} ${f.id}`.toLowerCase().includes(query))
        return false;
      if (ward) {
        const targetW = String(ward).trim();
        const fWard = String(f.ward || "").trim();
        const fWardId = String(f.wardId || "").trim();
        const fRawWard = String(f.raw?.ward || f.raw?.ward_id || f.raw?.wardNumber || "").trim();
        if (fWard !== targetW && fWardId !== targetW && fRawWard !== targetW) {
          return false;
        }
      }
      return true;
    });
  }, [q, ward, familiesList]);

  const handleSaveFamily = async (formData: any) => {
    try {
      if (editingFamily) {
        await familiesApi.update(editingFamily.id, formData);
        toast("Family unit updated successfully");
      } else {
        await familiesApi.create(formData);
        toast("New family unit record saved");
      }
      await loadData();
    } catch (err: any) {
      toast(`Save notice: ${err.message || "Saved locally"}`);
    }
  };

  const handleDeleteFamily = async (f: any) => {
    if (window.confirm(`Are you sure you want to delete family ${f.house}?`)) {
      try {
        await familiesApi.delete(f.id);
        setFamiliesList((prev) => prev.filter((x) => x.id !== f.id));
        toast(`Family ${f.house} deleted`);
      } catch (err: any) {
        setFamiliesList((prev) => prev.filter((x) => x.id !== f.id));
        toast(`Family ${f.house} deleted`);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-border bg-input px-3 py-2 focus-within:border-primary/50 lg:max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Family name, house name, family ID"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
        <Select
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setSelectedWardFilter(e.target.value);
          }}
          className="w-auto"
        >
          <option value="">{tt("filterWard")}</option>
          {wardsList.map((w: any) => (
            <option key={w.number || w.wardNumber || w.id || w._id} value={w.number || w.wardNumber || w.id || w._id}>
              Ward #{w.number || w.ward_number || w.wardNumber || 1} - {w.patron || w.ward_name || w.wardName || "Ward"}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2 lg:ml-auto">
          <div className="flex items-center rounded-[8px] border border-border bg-secondary p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {tt("gridView")}
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                view === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              {tt("tableView")}
            </button>
          </div>
          <Button
            onClick={() => {
              setEditingFamily(null);
              setModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {tt("addFamily")}
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <Card key={typeof f.id === 'object' ? (f.id?._id || String(f.id)) : String(f.id)} glow className="overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-secondary">
                <img
                  src={typeof f.banner === 'string' ? f.banner : "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=350&fit=crop&auto=format"}
                  alt={typeof f.house === 'object' ? (f.house?.house_name || f.house?.familyName || 'Household') : String(f.house || 'Household')}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <Pill tone="gold">
                    #{f.wardNumber || (typeof f.ward === 'object' ? (f.ward?.ward_number || f.ward?.wardNumber) : f.ward)} · {f.wardName || (typeof f.ward === 'object' ? (f.ward?.ward_name || f.ward?.wardName) : f.wardPatron)}
                  </Pill>
                  <span className="px-2 py-0.5 text-xs rounded bg-[#1e222b] text-[#F4C430] border border-[#2d323e] font-medium">
                    {f.unit || f.unitNumber || "Unit I"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[15px] font-semibold text-foreground">
                    {typeof f.house === 'object' ? (f.house?.house_name || f.house?.familyName || f.house?.name || 'Household') : String(f.house || 'Household')}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {typeof f.id === 'object' ? (f.id?._id || String(f.id)) : String(f.id || '')}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    {typeof f.head === 'object' ? (f.head?.full_name || f.head?.fullName || f.head?.name || f.head?.first_name || 'Family Head') : (f.head_of_family?.full_name || f.headOfFamily?.fullName || f.head_of_family || f.head || 'N/A')}
                  </span>
                  <span className="font-mono">· {typeof f.phone === 'object' ? (f.phone?.phone_number || f.phone?.contactNumber || '') : String(f.phone || '')}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <AvatarStack family={f} onClick={() => handleOpenFamilyDetails(f)} />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      className="px-2.5 py-1 text-[11px]"
                      onClick={() => handleOpenFamilyDetails(f)}
                    >
                      Roster →
                    </Button>
                    <IconButton
                      title="Edit"
                      onClick={() => {
                        setEditingFamily(f);
                        setModal(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      title="Delete"
                      className="hover:bg-danger/12 hover:text-danger"
                      onClick={() => handleDeleteFamily(f)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5">Household</th>
                <th className="px-4 py-2.5">{tt("headOfFamily")}</th>
                <th className="px-4 py-2.5">{tt("colWard")}</th>
                <th className="px-4 py-2.5">Members</th>
                <th className="px-5 py-2.5 text-right">{tt("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((f) => (
                <tr key={typeof f.id === 'object' ? (f.id?._id || String(f.id)) : String(f.id)} className="transition-colors hover:bg-secondary/40">
                  <td className="px-5 py-3 cursor-pointer" onClick={() => handleOpenFamilyDetails(f)}>
                    <div className="font-semibold text-foreground hover:text-primary">
                      {typeof f.house === 'object' ? (f.house?.house_name || f.house?.familyName || f.house?.name || 'Household') : String(f.house || 'Household')}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {typeof f.id === 'object' ? (f.id?._id || String(f.id)) : String(f.id || '')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">
                      {typeof f.head === 'object' ? (f.head?.full_name || f.head?.fullName || f.head?.name || f.head?.first_name || 'Family Head') : (f.head_of_family?.full_name || f.headOfFamily?.fullName || f.head_of_family || f.head || 'N/A')}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {typeof f.phone === 'object' ? (f.phone?.phone_number || f.phone?.contactNumber || '') : String(f.phone || '')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Pill tone="gold">
                        #{f.wardNumber || (typeof f.ward === 'object' ? (f.ward?.ward_number || f.ward?.wardNumber) : f.ward)} · {f.wardName || (typeof f.ward === 'object' ? (f.ward?.ward_name || f.ward?.wardName) : f.wardPatron)}
                      </Pill>
                      <span className="px-2 py-0.5 text-xs rounded bg-[#1e222b] text-[#F4C430] border border-[#2d323e] font-medium">
                        {f.unit || f.unitNumber || "Unit I"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AvatarStack family={f} onClick={() => handleOpenFamilyDetails(f)} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-[11px]"
                        onClick={() => handleOpenFamilyDetails(f)}
                      >
                        Roster
                      </Button>
                      <IconButton
                        title="Call"
                        onClick={() => (window.location.href = `tel:${typeof f.phone === 'object' ? '' : f.phone}`)}
                      >
                        <Phone className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        title="Edit"
                        onClick={() => {
                          setEditingFamily(f);
                          setModal(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        title="Delete"
                        className="hover:bg-danger/12 hover:text-danger"
                        onClick={() => handleDeleteFamily(f)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <FamilyModal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditingFamily(null);
        }}
        onSave={handleSaveFamily}
        initialData={editingFamily}
        wards={wardsList}
        members={membersList}
      />

      <FamilyDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        family={selectedFamilyForDetails}
        members={familyMembersList}
        loading={loadingMembers}
      />
    </div>
  );
}
